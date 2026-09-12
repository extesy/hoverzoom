# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///

"""Build browser-specific Hover Zoom release archives."""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
PACKAGE_DIRECTORIES = ("_locales", "css", "fonts", "html", "images", "js", "plugins")
PACKAGE_FILES = ("LICENSE", "manifest.json", "ruleset.json")
BROWSERS = ("chrome", "firefox", "edge")
FORBIDDEN_FIREFOX_HEADERS = {
    "access-control-allow-origin",
    "cross-origin-resource-policy",
}


class ReleaseError(RuntimeError):
    """A release artifact could not be built safely."""


def load_json(path: Path) -> Any:
    try:
        with path.open(encoding="utf-8") as source:
            return json.load(source)
    except (OSError, json.JSONDecodeError) as error:
        raise ReleaseError(f"Could not read {path.name}: {error}") from error


def write_json(path: Path, value: Any) -> None:
    try:
        with path.open("w", encoding="utf-8", newline="\n") as destination:
            json.dump(value, destination, ensure_ascii=False, indent=2)
            destination.write("\n")
    except OSError as error:
        raise ReleaseError(f"Could not write {path.name}: {error}") from error


def format_with_jq(path: Path) -> None:
    """Normalize staged JSON after its browser-specific changes are applied."""
    formatted_path = path.with_name(f"{path.name}.formatted")
    try:
        with formatted_path.open("w", encoding="utf-8", newline="\n") as destination:
            subprocess.run(
                ("jq", ".", str(path)),
                check=True,
                stdout=destination,
            )
        formatted_path.replace(path)
    except FileNotFoundError as error:
        raise ReleaseError("jq is required to build a release archive.") from error
    except (OSError, subprocess.CalledProcessError) as error:
        raise ReleaseError(f"Could not format {path.name} with jq: {error}") from error
    finally:
        formatted_path.unlink(missing_ok=True)


def copy_package_source(stage: Path) -> None:
    for directory in PACKAGE_DIRECTORIES:
        source = ROOT / directory
        if not source.is_dir():
            raise ReleaseError(f"Required directory is missing: {directory}")
        shutil.copytree(source, stage / directory)

    for filename in PACKAGE_FILES:
        source = ROOT / filename
        if not source.is_file():
            raise ReleaseError(f"Required file is missing: {filename}")
        shutil.copy2(source, stage / filename)


def customize_manifest(stage: Path, browser: str) -> None:
    path = stage / "manifest.json"
    manifest = load_json(path)
    background = manifest.get("background") if isinstance(manifest, dict) else None
    if not isinstance(background, dict):
        raise ReleaseError("manifest.json does not contain a background object.")

    if browser == "firefox":
        required_key, unwanted_key = "scripts", None
    else:
        required_key, unwanted_key = "service_worker", "scripts"

    if required_key not in background:
        raise ReleaseError(f"manifest.json is missing background.{required_key}.")

    if unwanted_key is not None:
        background.pop(unwanted_key, None)
    write_json(path, manifest)
    format_with_jq(path)


def is_forbidden_firefox_header(header: Any) -> bool:
    return (
        isinstance(header, dict)
        and isinstance(header.get("header"), str)
        and header["header"].casefold() in FORBIDDEN_FIREFOX_HEADERS
    )


def customize_firefox_ruleset(stage: Path) -> None:
    path = stage / "ruleset.json"
    rules = load_json(path)
    if not isinstance(rules, list):
        raise ReleaseError("ruleset.json must contain a JSON array.")

    filtered_rules: list[Any] = []
    for rule in rules:
        action = rule.get("action") if isinstance(rule, dict) else None
        if not isinstance(action, dict) or action.get("type") != "modifyHeaders":
            filtered_rules.append(rule)
            continue

        for field in ("requestHeaders", "responseHeaders"):
            headers = action.get(field)
            if headers is None:
                continue
            if not isinstance(headers, list):
                raise ReleaseError(f"Rule {rule.get('id')} has an invalid {field} value.")

            retained_headers = [
                header for header in headers if not is_forbidden_firefox_header(header)
            ]
            if retained_headers:
                action[field] = retained_headers
            else:
                action.pop(field, None)

        if "requestHeaders" not in action and "responseHeaders" not in action:
            continue
        filtered_rules.append(rule)

    write_json(path, filtered_rules)
    format_with_jq(path)


def verify_variant(stage: Path, browser: str) -> None:
    manifest = load_json(stage / "manifest.json")
    background = manifest.get("background") if isinstance(manifest, dict) else None
    if not isinstance(background, dict):
        raise ReleaseError("Generated manifest.json does not contain a background object.")

    if browser != "firefox":
        if "service_worker" not in background or "scripts" in background:
            raise ReleaseError(f"{browser.title()} manifest.json has an invalid background configuration.")
        return

    rules = load_json(stage / "ruleset.json")
    if not isinstance(rules, list):
        raise ReleaseError("Generated Firefox ruleset.json is not an array.")

    for rule in rules:
        action = rule.get("action") if isinstance(rule, dict) else None
        if not isinstance(action, dict):
            continue
        for field in ("requestHeaders", "responseHeaders"):
            headers = action.get(field, [])
            if any(is_forbidden_firefox_header(header) for header in headers):
                raise ReleaseError(
                    "Firefox ruleset.json still modifies a prohibited security header."
                )


def create_archive(stage: Path, archive_path: Path) -> None:
    try:
        with zipfile.ZipFile(
            archive_path,
            mode="w",
            compression=zipfile.ZIP_DEFLATED,
            compresslevel=9,
        ) as archive:
            for path in sorted(stage.rglob("*")):
                if path.is_file():
                    archive.write(path, path.relative_to(stage).as_posix())
    except OSError as error:
        raise ReleaseError(f"Could not create {archive_path.name}: {error}") from error


def build_variant(browser: str, workspace: Path) -> Path:
    print(f"Building {browser} release...")
    stage = workspace / browser
    stage.mkdir()
    copy_package_source(stage)
    customize_manifest(stage, browser)
    if browser == "firefox":
        customize_firefox_ruleset(stage)
    verify_variant(stage, browser)

    archive_path = workspace / f"hoverzoom_{browser}.zip"
    create_archive(stage, archive_path)
    return archive_path


def publish_archives(archives: list[Path]) -> None:
    for archive in archives:
        archive.replace(ROOT / archive.name)


def main() -> int:
    if shutil.which("jq") is None:
        raise ReleaseError("jq is required to build a release archive.")

    with tempfile.TemporaryDirectory(prefix=".hoverzoom-release-", dir=ROOT) as temporary_directory:
        workspace = Path(temporary_directory)
        archives = [build_variant(browser, workspace) for browser in BROWSERS]
        publish_archives(archives)

    print("Created hoverzoom_chrome.zip, hoverzoom_firefox.zip, and hoverzoom_edge.zip.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except ReleaseError as error:
        print(f"release: {error}", file=sys.stderr)
        raise SystemExit(1) from error
