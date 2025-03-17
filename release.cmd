@echo off
del hoverzoom.zip >nul
winrar a -afzip -m5 -r hoverzoom.zip _locales css fonts html images js plugins LICENSE manifest.json ruleset.json -xnode_modules -x.idea

