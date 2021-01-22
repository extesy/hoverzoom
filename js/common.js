var factorySettings = {
    extensionEnabled : true,
    zoomFactor : 1,
    zoomVideos : true,
    videoPositionStep : 10,
    muteVideos : false,
    videoTimestamp : false,
    videoVolume : 0.25,
    pageActionEnabled : true,
    showHighRes : true,
    galleriesMouseWheel : true,
    disableMouseWheelForVideo : false,
    addToHistory : false,
    alwaysPreload : false,
    displayDelay : 100,
    displayDelayVideo : 500,
    fadeDuration : 200,
    excludedSites : [],
    whiteListMode : false,
    picturesOpacity : 1,
    showWhileLoading : true,
    mouseUnderlap : true,
    filterNSFW : false,
    enableGalleries : true,
    ambilightEnabled : false,
    ambilightHaloSize : 0.1,
    ambilightBackgroundOpacity : 0.9,
    disabledPlugins : [],
    centerImages : false,
    frameBackgroundColor: "#ffffff",
    displayImageLoader: true,
    enlargementThresholdEnabled : true,
    enlargementThreshold : 2,
    displayedSizeThresholdEnabled : true,
    displayedSizeThreshold : 300,
    zoomedSizeThresholdEnabled : true,
    zoomedSizeThreshold : 100,
    downloadFolder : '',
    useSeparateTabOrWindowForUnloadableUrlsEnabled: false,
    useSeparateTabOrWindowForUnloadableUrls: 'window',
    captionLocation : 'below',
    actionKey : 0,
    fullZoomKey : 90,
    hideKey : 88,
    openImageInWindowKey : 87,
    openImageInTabKey : 84,
    saveImageKey : 83,
    prevImgKey : 37,
    nextImgKey : 39
}

// Load options from factory settings (= as if extension has just been installed from webstore)
function loadFactorySettings() {
    return factorySettings;
}

// Load options from local storage
// Return default values if none exist
function loadOptions() {
    var options;
    if (localStorage.options == null) {
        localStorage.options = '{}';
    }
    options = JSON.parse(localStorage.options);  // TODO: Migrate to https://developer.chrome.com/extensions/storage

    options.extensionEnabled = options.hasOwnProperty('extensionEnabled') ? options.extensionEnabled : factorySettings.extensionEnabled;
    options.zoomFactor = options.hasOwnProperty('zoomFactor') ? options.zoomFactor : factorySettings.zoomFactor;
    options.zoomVideos = options.hasOwnProperty('zoomVideos') ? options.zoomVideos : factorySettings.zoomVideos;
    options.videoPositionStep = options.hasOwnProperty('videoPositionStep') ? options.videoPositionStep : factorySettings.videoPositionStep;
    options.muteVideos = options.hasOwnProperty('muteVideos') ? options.muteVideos : factorySettings.muteVideos;
    options.videoTimestamp = options.hasOwnProperty('videoTimestamp') ? options.videoTimestamp : factorySettings.videoTimestamp;
    options.videoVolume = options.hasOwnProperty('videoVolume') ? options.videoVolume : factorySettings.videoVolume;
    options.pageActionEnabled = options.hasOwnProperty('pageActionEnabled') ? options.pageActionEnabled : factorySettings.pageActionEnabled;
    options.showHighRes = options.hasOwnProperty('showHighRes') ? options.showHighRes : factorySettings.showHighRes;
    options.galleriesMouseWheel = options.hasOwnProperty('galleriesMouseWheel') ? options.galleriesMouseWheel : factorySettings.galleriesMouseWheel;
    options.disableMouseWheelForVideo = options.hasOwnProperty('disableMouseWheelForVideo') ? options.disableMouseWheelForVideo : factorySettings.disableMouseWheelForVideo;
    options.addToHistory = options.hasOwnProperty('addToHistory') ? options.addToHistory : factorySettings.addToHistory;
    options.alwaysPreload = options.hasOwnProperty('alwaysPreload') ? options.alwaysPreload : factorySettings.alwaysPreload;
    options.displayDelay = options.hasOwnProperty('displayDelay') ? options.displayDelay : factorySettings.displayDelay;
    options.displayDelayVideo = options.hasOwnProperty('displayDelayVideo') ? options.displayDelayVideo : factorySettings.displayDelayVideo;
    options.fadeDuration = options.hasOwnProperty('fadeDuration') ? options.fadeDuration : factorySettings.fadeDuration;
    options.excludedSites = options.hasOwnProperty('excludedSites') ? options.excludedSites : factorySettings.excludedSites;
    options.whiteListMode = options.hasOwnProperty('whiteListMode') ? options.whiteListMode : factorySettings.whiteListMode;
    options.picturesOpacity = options.hasOwnProperty('picturesOpacity') ? options.picturesOpacity : factorySettings.picturesOpacity;
    options.showWhileLoading = options.hasOwnProperty('showWhileLoading') ? options.showWhileLoading : factorySettings.showWhileLoading;
    options.mouseUnderlap = options.hasOwnProperty('mouseUnderlap') ? options.mouseUnderlap : factorySettings.mouseUnderlap;
    options.filterNSFW = options.hasOwnProperty('filterNSFW') ? options.filterNSFW : factorySettings.filterNSFW;
    options.enableGalleries = options.hasOwnProperty('enableGalleries') ? options.enableGalleries : factorySettings.enableGalleries;
    options.ambilightEnabled = options.hasOwnProperty('ambilightEnabled') ? options.ambilightEnabled : factorySettings.ambilightEnabled;
    options.ambilightHaloSize = options.hasOwnProperty('ambilightHaloSize') ? options.ambilightHaloSize : factorySettings.ambilightHaloSize;
    options.ambilightBackgroundOpacity = options.hasOwnProperty('ambilightBackgroundOpacity') ? options.ambilightBackgroundOpacity : factorySettings.ambilightBackgroundOpacity;
    options.disabledPlugins = options.hasOwnProperty('disabledPlugins') ? options.disabledPlugins : factorySettings.disabledPlugins;
    options.centerImages = options.hasOwnProperty('centerImages') ? options.centerImages : factorySettings.centerImages;
    options.frameBackgroundColor = options.hasOwnProperty('frameBackgroundColor') ? options.frameBackgroundColor : factorySettings.frameBackgroundColor;
    options.displayImageLoader = options.hasOwnProperty('displayImageLoader') ? options.displayImageLoader : factorySettings.displayImageLoader;
    options.enlargementThresholdEnabled = options.hasOwnProperty('enlargementThresholdEnabled') ? options.enlargementThresholdEnabled : factorySettings.enlargementThresholdEnabled;
    options.enlargementThreshold = options.hasOwnProperty('enlargementThreshold') ? options.enlargementThreshold : factorySettings.enlargementThreshold;
    options.displayedSizeThresholdEnabled = options.hasOwnProperty('displayedSizeThresholdEnabled') ? options.displayedSizeThresholdEnabled : factorySettings.displayedSizeThresholdEnabled;
    options.displayedSizeThreshold = options.hasOwnProperty('displayedSizeThreshold') ? options.displayedSizeThreshold : factorySettings.displayedSizeThreshold;
    options.zoomedSizeThresholdEnabled = options.hasOwnProperty('zoomedSizeThresholdEnabled') ? options.zoomedSizeThresholdEnabled : factorySettings.zoomedSizeThresholdEnabled;
    options.zoomedSizeThreshold = options.hasOwnProperty('zoomedSizeThreshold') ? options.zoomedSizeThreshold : factorySettings.zoomedSizeThreshold;
    options.downloadFolder = options.hasOwnProperty('downloadFolder') ? options.downloadFolder : factorySettings.downloadFolder;
    options.useSeparateTabOrWindowForUnloadableUrlsEnabled = options.hasOwnProperty('useSeparateTabOrWindowForUnloadableUrlsEnabled') ? options.useSeparateTabOrWindowForUnloadableUrlsEnabled : factorySettings.useSeparateTabOrWindowForUnloadableUrlsEnabled;
    options.useSeparateTabOrWindowForUnloadableUrls = options.hasOwnProperty('useSeparateTabOrWindowForUnloadableUrls') ? options.useSeparateTabOrWindowForUnloadableUrls : factorySettings.useSeparateTabOrWindowForUnloadableUrls;

    // Used old showCaptions option for backwards compatibility
    var showCaptions = options.hasOwnProperty('showCaptions') ? options.showCaptions : true;
    options.captionLocation = options.hasOwnProperty('captionLocation') ? options.captionLocation : (showCaptions ? factorySettings.captionLocation : 'none');

    // Action keys
    options.actionKey = options.hasOwnProperty('actionKey') ? options.actionKey : factorySettings.actionKey;
    options.fullZoomKey = options.hasOwnProperty('fullZoomKey') ? options.fullZoomKey : factorySettings.fullZoomKey;
    options.hideKey = options.hasOwnProperty('hideKey') ? options.hideKey : factorySettings.hideKey;
    options.openImageInWindowKey = options.hasOwnProperty('openImageInWindowKey') ? options.openImageInWindowKey : factorySettings.openImageInWindowKey;
    options.openImageInTabKey = options.hasOwnProperty('openImageInTabKey') ? options.openImageInTabKey : factorySettings.openImageInTabKey;
    options.saveImageKey = options.hasOwnProperty('saveImageKey') ? options.saveImageKey : factorySettings.saveImageKey;
    options.prevImgKey = options.hasOwnProperty('prevImgKey') ? options.prevImgKey : factorySettings.prevImgKey;
    options.nextImgKey = options.hasOwnProperty('nextImgKey') ? options.nextImgKey : factorySettings.nextImgKey;

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
