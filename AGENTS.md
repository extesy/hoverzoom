# AGENTS.md

Project map for agents. Goal: skip the exploration phase and go straight to fixing bugs in Hover Zoom+.

This file is a **living document**: keep it always correct and make it more useful with every session.

- After each session, fold back what you learned into the matching section, in the same change as the code that taught it. Not every change warrants a new rule: only capture insights that are generic enough to stay useful outside the immediate context of the last conversation — non-obvious root-cause mechanics, surprising behavior, new gotchas/invariants, better reproduction or debugging recipes. Skip task-specific details, one-off debugging narratives, and anything that is obvious from reading the code.
- When code or architecture changes (moved/renamed files, functions, DOM ids, options, flows, tooling), update the affected sections immediately — a stale document is worse than none.
- Keep it terse and durable: stable names instead of line numbers, facts/invariants/recipes instead of narration. Correct or delete what is no longer true instead of appending contradictions; resist letting it grow into a changelog.

## What this is

Chrome MV3 extension ("Hover Zoom+") that shows a floating, zoomed preview (image/video/audio) next to the cursor while hovering links/thumbnails. Plain classic-script JavaScript: **no build step, no npm, no node_modules, no test suite**. Everything runs as content scripts in the page's isolated world.

## Repo layout

- `js/hoverzoom.js` — all core behavior (~5k lines, single closure). Hover detection, viewer creation/positioning, media loading, key/mouse/wheel handling, galleries, video/audio/HLS playback. Most bugs are fixed here.
- `js/common.js` — default `options` object (single source of truth for option names/defaults), key-binding defaults, shared helpers used by content script, background, options and popup pages.
- `js/background.js` — MV3 service worker (permissions, history, downloads, messaging).
- `js/tools.js`, `js/plugins.js`, `js/findMatchingBracket.js` — small shared helpers loaded before `hoverzoom.js`.
- `plugins/*.js` — one small script per supported site; each registers into the global `hoverZoomPlugins` list and resolves full-size media URLs for its site. `plugins/default.js` is always loaded (generic fallback). Per-site plugins are injected via their own `content_scripts` entries in `manifest.json` (matched by domain; several plugins can share a domain, e.g. reddit).
- `html/options.html` + `js/options.js`, `html/popup.html` + `js/popup.js` — options UI and toolbar popup. Control ids mirror option names (`chk*`, `txt*`, `sel*`, `rng*`).
- `_locales/*/messages.json` — all UI strings; option labels/tooltips are `opt*` keys. **Read `opt*` in `_locales/en/messages.json` to learn an option's real semantics** — several are negated (e.g. `optDisableMouseWheelForVideo` = "don't use mousewheel to navigate within video"; checked disables seeking).
- `js/hls.js` — vendored hls.js (webpack bundle) for HLS/DASH video playlists. `js/jszip.js` vendored for the pixiv plugin. `js/jquery-3.7.1.js`, `js/gumby.js` (options-page UI framework) vendored too.
- `manifest.json` — MV3, min Chrome 130. Core content script = jquery + tools + common + plugins + `plugins/default.js` + hoverzoom + hls + findMatchingBracket, on `<all_urls>`, `all_frames: true`. A few sites need page-world shims exposed as web-accessible resources (`js/hoverZoomXHROpen.js`, `js/duckduckgoInjected.js`, `js/hoverZoomVintedFetch.js`).
- `release.py` / `release.cmd` — packaging. `CHANGELOG.md` is **auto-generated** by github_changelog_generator — never hand-edit it.

## Core architecture (`js/hoverzoom.js`)

One big closure (`loadHoverZoom()`) with shared mutable state. Variables you actually need to know:

- `imgFullSize` — jQuery of the displayed media element (`<img>` or `<video>`); `null` = nothing displayed.
- `srcDetails` — current source: `url`, `audioUrl`, `subtitlesUrl`, `video`/`playlist`/`audio` flags, `naturalWidth`/`naturalHeight`, `naturalSrc` (the source the natural dims were sampled for).
- `hls` — hls.js instance for playlist playback (module scope, shared).
- `viewerLocked`, `zoomFactor` — lock/zoom mode state; `loading`; key-state flags (`actionKeyDown`, `fullZoomKeyDown`, `hideKeyDown`, `plusKeyDown`/`minusKeyDown`/`arrowUp/DownKeyDown`, `zoomSpeedFactor`).
- `currentSrcToken` — bumped when a new source is scheduled so an in-flight viewer close (fade-out) cannot wipe the new source's state. Keep this invariant wherever a source is scheduled.
- `lastScrollTime` + `options.scrollWheelCooldown` — wheel throttle.

Lifecycle (memorize this chain):

1. `prepareImgLinks` / `prepareImgLinksAsync` — scan DOM, run plugins, tag hoverable elements (MutationObserver keeps up with dynamic pages).
2. `documentMouseMove` — finds `.hoverZoomLink` in the target's ancestry, schedules `loadFullSizeImage` after `displayDelay` / `displayDelayVideo`; while a preview is displayed it just calls `posViewer()`.
3. `loadFullSizeImage` — creates the media element (`<video>`, hidden `<audio>` + spectrogram `<img>`, HLS playlist via hls.js, or `<img>`).
4. Media events (`loadedmetadata`, `loadeddata`) → `displayFullSizeImage()` builds the viewer DOM and fades it in.
5. `posViewer()` — ALL sizing and positioning; re-run on every mousemove over the same link.

Viewer DOM (built fresh by `displayFullSizeImage`, which empties `#hzViewer` and recreates its children):

- `#hzViewer` — root, appended to `document.body` (`hoverZoom.hzViewer`, jQuery).
- `#hzContainer` — flex wrapper (`hz.hzViewer.hzContainer`); media is appended into it.
- `#hzLoader` — loading spinner; its `.imgLoading` class gates the "loaded" branch of `posViewer` (sizing is skipped while loading).
- `#hzAbove` / `#hzBelow` — caption + details rows; `#hzGallery` — gallery counter; `#hzPlaybackProgress` — video progress overlay; `#hzMsg` — warnings.

Hover targets and their jQuery data: `hoverZoomSrc` (array of candidate full-size URLs, chosen via `hoverZoomSrcIndex`), `hoverZoomAudioSrc`, `hoverZoomGallerySrc` + `hoverZoomGalleryIndex`, `hoverZoomCaption`.

Multi-stream URL convention produced by plugins and parsed by `getVideoAudioSubtitlesFromUrl()`:

```
videourl.video[_audiourl(.audio|.audiomuted)][_subtitlesurl.subtitles]
```

Special case: `v.redd.it/<id>` URLs are rewritten to `HLSPlaylist.m3u8` and played through hls.js (video+audio muxed, so native controls work).

## Gotchas and invariants

- **`<video>` has no `naturalWidth/Height`.** Its decoded size (`videoWidth/videoHeight`) changes when an adaptive stream switches rendition (ABR, seek rebuffer). Viewer geometry must come from `srcDetails.naturalWidth/Height` (sampled once per source, keyed by `srcDetails.naturalSrc`, via `getVideoNaturalSize()` / `getBestHlsLevel()` = best rendition) — never from the live decode size, or the viewer will resize mid-hover.
- hls.js level control: `hls.loadLevel = i` sets `manualLevel` — a persistent pin for all subsequent loads that also seeds the start level. `hls.currentLevel = i` additionally flushes the buffer (`immediateLevelSwitch`). With `autoStartLoad: false` you can pick the level on `MANIFEST_PARSED` and then call `hls.startLoad()`. `hls.levels[i].width/height/bitrate` = rendition metadata from the manifest.
- `posViewer()` order matters: reset media to `width:auto/height:auto` → sample natural dims → pick ONE of four width modes: `viewerLocked` (`naturalWidth * zoomFactor`), `fullZoomKeyDown` (window width), `mouseUnderlap || viewerLocked` a.k.a. "fullZoom" (capped to window), else fit next to the cursor. Then height clamp + caption fitting (`adjustCaptionMiscellaneousDetails`) + position clamping. Preserve this order.
- Display modes: `mouseUnderlap` (default on) allows the preview under the cursor and window-caps its size; `viewerLocked` (via `lockImageKey` or `autoLockImages`) centers the viewer (`position:fixed`), enables wheel zoom of `zoomFactor` and panning via `panLockedViewer` (CSS `transform` on `#hzViewer`); `fullZoomKeyDown` (hold `fullZoomKey`) forces window-filling width and also freezes `documentMouseMove` hover handling.
- Action keys: options hold `event.which` keyboard codes; mouse buttons are negative codes — `-1` right-hold, `-2` middle-hold, `-3` right short, `-4` middle short. Dispatch goes through `mouseAction()` with hold timers (`options.mouseClickHoldTime`) and `preventDefaultMouseAction()` gating `contextmenu`/`auxclick`.
- Wheel: non-passive `window` listener `documentOnMouseWheel` (it `preventDefault()`s whenever it handles an event). Branch order: gallery navigation (`galleriesMouseWheel`, **skipped while `viewerLocked`** — a locked viewer always zooms on scroll) → zoom when `viewerLocked` → video seeking by `options.videoPositionStep` seconds (skipped when `disableMouseWheelForVideo` is checked). Same seek is reachable via `prevImgKey`/`nextImgKey` → `changeVideoPosition()`; gallery rotation too (`rotateGalleryImg` when `hoverZoomGallerySrc.length > 1`).
- Locked-viewer refit: `zoomFactor` is keyed to the source it was set for (`zoomFactorSrc`, stamped at both lock entries: `lockImageKey` and the `autoLockImages` branch). In `posViewer`, whenever `viewerLocked` and `srcDetails.naturalSrc` differs, `zoomFactor` is re-fitted to `min(1, availW/naturalWidth, availH/naturalHeight)` so a newly rotated gallery item starts on screen instead of inheriting the previous item's zoom. Wheel zoom on the same source never re-fits.
- Click-through: `#hzViewer`'s click handler simulates a click on `hz.currentLink` (this is how clicking a preview reaches the page — the viewer only intercepts pointer events while locked). Exception: clicks whose target is a `<video>` are NOT forwarded, so a locked video's native pause/play can't open the underlying post/story. Locked image clicks still forward (intended).
- Closing: `closeHoverZoomViewer(now)` (fade vs instant), `cancelSourceLoading()`, left-click on the page, `closeKey`/`banKey`/`toggleKey`, tab `visibilitychange`. Gallery image→image swaps reuse the same `imgFullSize` and just change its `src`; media-type changes recreate the element (`removeMedias()` + `loadFullSizeImage()`).
- **Nested hover targets: the outermost wins.** `documentMouseMove` builds `target.parents('.hoverZoomLink').add(target)`; jQuery `.add()` returns document order and `.data()` reads the first element, i.e. the outermost `.hoverZoomLink`. A plugin that tags both a wrapper and an element inside it must give the wrapper the intended source.
- `debug = true` at the top of `hoverzoom.js` enables `cLog`/`cTime*`/`Logger` and also hls.js verbose logging (`new Hls({debug})`) — noisy but useful.

## Development and verification workflow

- Syntax check: `node --check js/hoverzoom.js`. There is nothing else to run (no tests/lint/build).
- The extension is loaded **unpacked from this repo** in the maintainer's browser. After editing JS: the maintainer must reload it in `chrome://extensions`, and the target page must be **re-navigated** to re-inject content scripts. Always ask before reloading pages — some sites start playing media on reload.
- Verify bugs through the maintainer's real, logged-in browser via **OMP Browser Relay**. Be a good citizen: don't navigate/reload their tabs unasked.
- Hover Zoom+ internals live in the content-script isolated world: page `evaluate` (main world) cannot see them. **Debug via DOM probes**: `#hzViewer` `getBoundingClientRect()`/style, `#hzViewer video` (`videoWidth/videoHeight`, `currentTime`, `style.width`). Stash element refs in a main-world global to detect viewer rebuilds (identity of `#hzContainer`/`video` nodes changes when `displayFullSizeImage()` re-runs).
- Interaction recipe for reproducing hover bugs: query `.hoverZoomLink` elements, pick one with a non-zero `getBoundingClientRect()`, `page.mouse.move()` to its center, wait `displayDelayVideo` (default 500 ms) + media load (poll for `videoWidth > 0`); `page.mouse.wheel({deltaY})` for wheel paths; keep the pointer inside that element while making "small mouse moves" (moving off the link closes the preview; a left click on page background closes/cancels it). Beware: the user's own mouse movement closes the preview — run a repro sequence in one uninterrupted browser call.
