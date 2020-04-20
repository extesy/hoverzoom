// Load options from local storage
// Return default values if none exist
function loadOptions() {
    var options;
    if (localStorage.options == null) {
        localStorage.options = '{}';
    }
    options = JSON.parse(localStorage.options);  // TODO: Migrate to https://developer.chrome.com/extensions/storage

    options.extensionEnabled = options.hasOwnProperty('extensionEnabled') ? options.extensionEnabled : true;
    options.zoomFactor = options.hasOwnProperty('zoomFactor') ? options.zoomFactor : 1;
    options.zoomVideos = options.hasOwnProperty('zoomVideos') ? options.zoomVideos : true;
    options.videoPositionStep = options.hasOwnProperty('videoPositionStep') ? options.videoPositionStep : 10;
    options.muteVideos = options.hasOwnProperty('muteVideos') ? options.muteVideos : false;
    options.videoTimestamp = options.hasOwnProperty('videoTimestamp') ? options.videoTimestamp : false;
    options.videoVolume = options.hasOwnProperty('videoVolume') ? options.videoVolume : 0.25;
    options.pageActionEnabled = options.hasOwnProperty('pageActionEnabled') ? options.pageActionEnabled : true;
    options.showHighRes = options.hasOwnProperty('showHighRes') ? options.showHighRes : true;
    options.galleriesMouseWheel = options.hasOwnProperty('galleriesMouseWheel') ? options.galleriesMouseWheel : true;
    options.disableMouseWheelForVideo = options.hasOwnProperty('disableMouseWheelForVideo') ? options.disableMouseWheelForVideo : false;
    options.addToHistory = options.hasOwnProperty('addToHistory') ? options.addToHistory : false;
    options.alwaysPreload = options.hasOwnProperty('alwaysPreload') ? options.alwaysPreload : false;
    options.displayDelay = options.hasOwnProperty('displayDelay') ? options.displayDelay : 100;
    options.displayDelayVideo = options.hasOwnProperty('displayDelayVideo') ? options.displayDelayVideo : 500;
    options.fadeDuration = options.hasOwnProperty('fadeDuration') ? options.fadeDuration : 200;
    options.excludedSites = options.hasOwnProperty('excludedSites') ? options.excludedSites : [];
    options.whiteListMode = options.hasOwnProperty('whiteListMode') ? options.whiteListMode : false;
    options.picturesOpacity = options.hasOwnProperty('picturesOpacity') ? options.picturesOpacity : 1;
    options.showWhileLoading = options.hasOwnProperty('showWhileLoading') ? options.showWhileLoading : true;
    options.mouseUnderlap = options.hasOwnProperty('mouseUnderlap') ? options.mouseUnderlap : true;
    options.filterNSFW = options.hasOwnProperty('filterNSFW') ? options.filterNSFW : false;
    options.enableGalleries = options.hasOwnProperty('enableGalleries') ? options.enableGalleries : true;
    options.ambilightEnabled = options.hasOwnProperty('ambilightEnabled') ? options.ambilightEnabled : false;
    options.disabledPlugins = options.hasOwnProperty('disabledPlugins') ? options.disabledPlugins : [];
    options.centerImages = options.hasOwnProperty('centerImages') ? options.centerImages : false;
    options.frameBackgroundColor = options.hasOwnProperty('frameBackgroundColor') ? options.frameBackgroundColor : "#ffffff";

    // Used old showCaptions option for backwards compatibility
    var showCaptions = options.hasOwnProperty('showCaptions') ? options.showCaptions : true;
    options.captionLocation = options.hasOwnProperty('captionLocation') ? options.captionLocation : (showCaptions ? 'below' : 'none');

    // Action keys
    options.actionKey = options.hasOwnProperty('actionKey') ? options.actionKey : 0;
    options.fullZoomKey = options.hasOwnProperty('fullZoomKey') ? options.fullZoomKey : 90;
    options.hideKey = options.hasOwnProperty('hideKey') ? options.hideKey : 88;
    options.openImageInWindowKey = options.hasOwnProperty('openImageInWindowKey') ? options.openImageInWindowKey : 87;
    options.openImageInTabKey = options.hasOwnProperty('openImageInTabKey') ? options.openImageInTabKey : 84;
    options.saveImageKey = options.hasOwnProperty('saveImageKey') ? options.saveImageKey : 83;
    options.prevImgKey = options.hasOwnProperty('prevImgKey') ? options.prevImgKey : 37;
    options.nextImgKey = options.hasOwnProperty('nextImgKey') ? options.nextImgKey : 39;

    localStorage.options = JSON.stringify(options);

    return options;
}

// Send options to all tabs and extension pages
function sendOptions(options) {
    var request = {action:'optionsChanged', 'options':options};

    // Send options to all tabs
    chrome.windows.getAll(null, function (windows) {
        for (var i = 0; i < windows.length; i++) {
            chrome.tabs.query({windowId: windows[i].id}, function (tabs) {
                for (var j = 0; j < tabs.length; j++) {
                    chrome.tabs.sendMessage(tabs[j].id, request);
                }
            });
        }
    });

    // Send options to other extension pages
    chrome.runtime.sendMessage(request);
}

// Return true is the url is part of an excluded site
function isExcludedSite(url) {
    var excluded = !options.whiteListMode;
    var siteAddress = url.substr(url.indexOf('://') + 3);
    if (siteAddress.substr(0, 4) == 'www.') {
        siteAddress = siteAddress.substr(4);
    }
    for (var i = 0; i < options.excludedSites.length; i++) {
        var es = options.excludedSites[i];
        if (es.substr(0, 4) == 'www.') {
            es = es.substr(4);
        }
        if (es && es.length <= siteAddress.length) {
            if (siteAddress.substr(0, es.length) == es) {
                return excluded;
            }
        }
    }
    return !excluded;
}

function keyCodeToKeyName(keyCode) {
    if (keyCode == 16) {
        return 'Shift';
    } else if (keyCode == 17) {
        return 'Ctrl';
    } else if (keyCode == 17) {
        return 'Command';
    } else if (keyCode >= 65 && keyCode <= 90) {
        return String.fromCharCode(keyCode);
    } else {
        return 'None';
    }
}

function i18n() {
    $('[data-i18n]').each(function(index, element) {
        var elem = $(element);
        elem.text(chrome.i18n.getMessage(elem.attr('data-i18n')));
    });
    $('[data-i18n-placeholder]').each(function(index, element) {
        var elem = $(element);
        elem.attr('placeholder', chrome.i18n.getMessage(elem.attr('data-i18n-placeholder')));
    });
    $('[data-i18n-tooltip]').each(function(index, element) {
        var elem = $(element);
        elem.attr('data-tooltip', chrome.i18n.getMessage(elem.attr('data-i18n-tooltip')));
    });
}
