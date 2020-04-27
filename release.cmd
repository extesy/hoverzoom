@echo off
del hoverzoom.zip >nul
winrar a -afzip -m5 -r hoverzoom.zip _locales\ar _locales\bg _locales\de _locales\en _locales\es _locales\fa _locales\fr _locales\hi _locales\hr _locales\hu _locales\id _locales\it _locales\ja _locales\ko _locales\nl _locales\no _locales\pl _locales\pt_BR _locales\pt_PT _locales\ru _locales\sv _locales\th _locales\tr _locales\zh_CN css fonts html images js plugins LICENSE manifest.json -xnode_modules -x.idea
