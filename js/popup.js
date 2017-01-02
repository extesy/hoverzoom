﻿var options,
    siteDomain,
    prgPreloading, lblPreloading, aPreload;

$(function () {
    i18n();

    options = loadOptions();
    prgPreloading = $('#prgPreloading');
    lblPreloading = $('#lblPreloading');

    aPreload = $('#aPreload');
    aPreload.click(aPreloadOnClick);

    $('#chkExtensionDisabled').parent().on('gumby.onChange', chkExtensionDisabledOnClick);

    if (!options.alwaysPreload) {
        aPreload.css('display', 'inline');
    }

    browser.permissions.contains({permissions: ['tabs']}, function (granted) {
        if (granted) {
            $('#chkExcludeSite').parent().on('gumby.onChange', chkExcludeSiteOnClick);
            setTabHook(options);
        } else {
            $('#chkExcludeSite').parent().on('gumby.onChange', askTabsPermissions);
        }
    });

    browser.runtime.onMessage.addListener(onMessage);
});

function askTabsPermissions() {
    browser.permissions.contains({permissions: ['tabs']}, function (granted) {
        if (!granted) {
            browser.permissions.request({permissions: ['tabs']}, function (granted) {
                if (granted) {
                    setTabHook(options);
                    window.close();
                }
            });
        }
    });
}

function setTabHook(options) {
    browser.tabs.getSelected(null, function (tab) {
        siteDomain = tab.url.split('/', 3)[2];
        $('#lblToggle').text(browser.i18n.getMessage(options.whiteListMode ? 'popEnableForSite' : 'popDisableForSite', siteDomain));
        $('#chkExtensionDisabled')[0].checked = !options.extensionEnabled;
        $('#chkExcludeSite')[0].checked = isExcludedSite(tab.url);
        $('input:checked').trigger('gumby.check');
    });
}

function chkExtensionDisabledOnClick() {
    options.extensionEnabled = !$('#chkExtensionDisabled')[0].checked;
    saveOptions();
}

function chkExcludeSiteOnClick() {
    // Get the excluded site index if it has already been added
    var excludedSiteIndex = -1;
    for (var i = 0; i < options.excludedSites.length; i++) {
        if (options.excludedSites[i] == siteDomain) {
            excludedSiteIndex = i;
            break;
        }
    }

    if ($('#chkExcludeSite')[0].checked) {
        if (excludedSiteIndex == -1)
            options.excludedSites.push(siteDomain);
    } else {
        if (excludedSiteIndex > -1)
            options.excludedSites.splice(excludedSiteIndex, 1);
    }

    saveOptions();
}

function saveOptions() {
    localStorage.options = JSON.stringify(options);
    sendOptions(options);
}

function onMessage(message, sender, callback) {
    switch (message.action) {
        case 'preloadAvailable':
            aPreload.css('display', 'inline');
            break;
        case 'preloadProgress':
            prgPreloading.attr('value', message.value).attr('max', message.max);
            lblPreloading.css('display', message.value < message.max ? 'inline' : 'none');
            if (message.value < message.max) {
                aPreload.css('display', 'none');
            }
            break;
        case 'askTabsPermissions':
            browser.permissions.request({permissions: ['tabs']}, function (granted) {
                callback(granted);
            });
            break;
    }
}

function aPreloadOnClick() {
    browser.tabs.executeScript(null, {code:'if (hoverZoom) { hoverZoom.preloadImages(); }'});
    aPreload.css('display', 'none');
    prgPreloading.attr('value', 0).attr('max', 1);
    lblPreloading.css('display', 'inline');
    return false;
}
