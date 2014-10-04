var options,
    siteDomain,
    prgPreloading, lblPreloading, aPreload;

$(function () {
    // Load options
    options = loadOptions();
    i18n();
    $('#dis-enable').text(options.whiteListMode ? 'Enable' : 'Disable');
    prgPreloading = $('#prgPreloading');
    lblPreloading = $('#lblPreloading');
    aPreload = $('#aPreload');

    aPreload.click(aPreloadOnClick);
    $('#chkExtensionDisabled').click(chkExtensionDisabledOnClick);
    $('#chkExcludeSite').click(chkExcludeSiteOnClick);

    if (!options.alwaysPreload) {
        aPreload.css('display', 'inline');
    }

    chrome.permissions.contains({permissions: ['tabs']}, function (granted) {
        if (granted)
            setTabHook(options);
        else {
            $('#chkExcludeSite').parent().parent().hide();
            chrome.permissions.request({permissions: ['tabs']}, function (granted) {
                if (granted)
                    setTabHook(options);
            });
        }
    });

    chrome.runtime.onMessage.addListener(onMessage);
});

function setTabHook(options) {
    chrome.tabs.getSelected(null, function (tab) {
        siteDomain = tab.url.split('/', 3)[2];
        $('#siteDomain').text(siteDomain);

        $('#chkExtensionDisabled')[0].checked = !options.extensionEnabled;

        for (var i = 0; i < options.excludedSites.length; i++) {
            if (options.excludedSites[i] == siteDomain) {
                $('#chkExcludeSite')[0].checked = true;
                break;
            }
        }
    });
}

function i18n() {
    $('#lblDisable').text(chrome.i18n.getMessage("popDisableForAllSites"));
    $('#lblFor').text(chrome.i18n.getMessage("popDisableForSite2"));
    $('#aPreload').text(chrome.i18n.getMessage("popPreloadImages"));
    $('#spanPreloading').text(chrome.i18n.getMessage("popPreloadingImages"));
    $('#aMoreOptions').text(chrome.i18n.getMessage("popMoreOptions"));
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
            chrome.permissions.request({permissions: ['tabs']}, function (granted) {
                callback(granted);
            });
            break;
    }
}

function aPreloadOnClick() {
    chrome.tabs.executeScript(null, {code:'if (hoverZoom) { hoverZoom.preloadImages(); }'});
    aPreload.css('display', 'none');
    prgPreloading.attr('value', 0).attr('max', 1);
    lblPreloading.css('display', 'inline');
    return false;
}
