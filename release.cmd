@echo off
del hoverzoom.zip >nul
"C:\Program Files\WinRAR\winrar.exe" a -afzip -m5 -r hoverzoom.zip _locales\* css\* fonts\* html\* images\* js\* plugins\* LICENSE manifest.json -xnode_modules
