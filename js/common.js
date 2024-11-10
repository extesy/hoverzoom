var factorySettings = {
    extensionEnabled : true,
    darkMode : false,
    zoomFactor : 1,
    zoomVideos : true,
    videoPositionStep : 10,
    muteVideos : false,
    videoTimestamp : false,
    videoVolume : 0.25,
    playAudio : false,
    audioVolume : 0.25,
    pageActionEnabled : true,
    showHighRes : true,
    galleriesMouseWheel : true,
    disableMouseWheelForVideo : false,
    addToHistory : false,
    allowHeadersRewrite : false,
    alwaysPreload : false,
    displayDelay : 100,
    displayDelayVideo : 500,
    fadeDuration : 200,
    excludedSites : [],
    whiteListMode : false,
    picturesOpacity : 1,
    showWhileLoading : true,
    mouseUnderlap : true,
    hideMouseCursor : false,
    hideMouseCursorDelay : 500,
    filterNSFW : false,
    enableGalleries : true,
    enableNoFocusMsg: false,
    ambilightEnabled : false,
    ambilightHaloSize : 0.1,
    ambilightBackgroundOpacity : 0.9,
    disabledPlugins : [],
    centerImages : false,
    autoLockImages : false,
    frameBackgroundColor: "#ffffff",
    frameThickness: 4,
    belowPositionOffset: 0,
    abovePositionOffset: 0,
    displayImageLoader: false,
    enlargementThresholdEnabled : true,
    enlargementThreshold : 2,
    displayedSizeThresholdEnabled : true,
    displayedSizeThreshold : 300,
    zoomedSizeThresholdEnabled : true,
    zoomedSizeThreshold : 100,
    downloadFolder : '',
    addDownloadOrigin : false,
    addDownloadSize : false,
    addDownloadDuration : false,
    addDownloadIndex : false,
    addDownloadCaption : false,
    replaceOriginalFilename : false,
    downloadFilename : '',
    useSeparateTabOrWindowForUnloadableUrlsEnabled: false,
    useSeparateTabOrWindowForUnloadableUrls: 'window',
    captionLocation : 'below',
    detailsLocation : 'none',
    fontSize : 11,
    fontOutline : false,
    actionKey : 0,
    toggleKey : 69,
    fullZoomKey : 90,
    copyImageKey: 67,
    copyImageUrlKey: 85,
    hideKey : 88,
    openImageInWindowKey : 87,
    openImageInTabKey : 84,
    lockImageKey : 76,
    saveImageKey : 83,
    prevImgKey : 37,
    nextImgKey : 39,
    flipImageKey : 70,
    closeKey : 27,
    debug : false
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
    options.darkMode = options.hasOwnProperty('darkMode') ? options.darkMode : factorySettings.darkMode;
    options.zoomFactor = options.hasOwnProperty('zoomFactor') ? options.zoomFactor : factorySettings.zoomFactor;
    options.zoomVideos = options.hasOwnProperty('zoomVideos') ? options.zoomVideos : factorySettings.zoomVideos;
    options.videoPositionStep = options.hasOwnProperty('videoPositionStep') ? options.videoPositionStep : factorySettings.videoPositionStep;
    options.muteVideos = options.hasOwnProperty('muteVideos') ? options.muteVideos : factorySettings.muteVideos;
    options.videoTimestamp = options.hasOwnProperty('videoTimestamp') ? options.videoTimestamp : factorySettings.videoTimestamp;
    options.videoVolume = options.hasOwnProperty('videoVolume') ? options.videoVolume : factorySettings.videoVolume;
    options.playAudio = options.hasOwnProperty('playAudio') ? options.playAudio : factorySettings.playAudio;
    options.audioVolume = options.hasOwnProperty('audioVolume') ? options.audioVolume : factorySettings.audioVolume;
    options.pageActionEnabled = options.hasOwnProperty('pageActionEnabled') ? options.pageActionEnabled : factorySettings.pageActionEnabled;
    options.showHighRes = options.hasOwnProperty('showHighRes') ? options.showHighRes : factorySettings.showHighRes;
    options.galleriesMouseWheel = options.hasOwnProperty('galleriesMouseWheel') ? options.galleriesMouseWheel : factorySettings.galleriesMouseWheel;
    options.disableMouseWheelForVideo = options.hasOwnProperty('disableMouseWheelForVideo') ? options.disableMouseWheelForVideo : factorySettings.disableMouseWheelForVideo;

    // These options are directly associated with browser permissions. Changing pemissions manually will make them out of sync.
    options.addToHistory = options.hasOwnProperty('addToHistory') ? options.addToHistory : factorySettings.addToHistory;
    options.allowHeadersRewrite = options.hasOwnProperty('allowHeadersRewrite') ? options.allowHeadersRewrite : factorySettings.allowHeadersRewrite;

    options.alwaysPreload = options.hasOwnProperty('alwaysPreload') ? options.alwaysPreload : factorySettings.alwaysPreload;
    options.displayDelay = options.hasOwnProperty('displayDelay') ? options.displayDelay : factorySettings.displayDelay;
    options.displayDelayVideo = options.hasOwnProperty('displayDelayVideo') ? options.displayDelayVideo : factorySettings.displayDelayVideo;
    options.fadeDuration = options.hasOwnProperty('fadeDuration') ? options.fadeDuration : factorySettings.fadeDuration;
    options.excludedSites = options.hasOwnProperty('excludedSites') ? options.excludedSites : factorySettings.excludedSites;
    options.whiteListMode = options.hasOwnProperty('whiteListMode') ? options.whiteListMode : factorySettings.whiteListMode;
    options.picturesOpacity = options.hasOwnProperty('picturesOpacity') ? options.picturesOpacity : factorySettings.picturesOpacity;
    options.showWhileLoading = options.hasOwnProperty('showWhileLoading') ? options.showWhileLoading : factorySettings.showWhileLoading;
    options.mouseUnderlap = options.hasOwnProperty('mouseUnderlap') ? options.mouseUnderlap : factorySettings.mouseUnderlap;
    options.hideMouseCursor = options.hasOwnProperty('hideMouseCursor') ? options.hideMouseCursor : factorySettings.hideMouseCursor;
    options.hideMouseCursorDelay = options.hasOwnProperty('hideMouseCursorDelay') ? options.hideMouseCursorDelay : factorySettings.hideMouseCursorDelay;
    options.filterNSFW = options.hasOwnProperty('filterNSFW') ? options.filterNSFW : factorySettings.filterNSFW;
    options.enableGalleries = options.hasOwnProperty('enableGalleries') ? options.enableGalleries : factorySettings.enableGalleries;
    options.enableNoFocusMsg = options.hasOwnProperty('enableNoFocusMsg') ? options.enableNoFocusMsg : factorySettings.enableNoFocusMsg;
    options.ambilightEnabled = options.hasOwnProperty('ambilightEnabled') ? options.ambilightEnabled : factorySettings.ambilightEnabled;
    options.ambilightHaloSize = options.hasOwnProperty('ambilightHaloSize') ? options.ambilightHaloSize : factorySettings.ambilightHaloSize;
    options.ambilightBackgroundOpacity = options.hasOwnProperty('ambilightBackgroundOpacity') ? options.ambilightBackgroundOpacity : factorySettings.ambilightBackgroundOpacity;
    options.disabledPlugins = options.hasOwnProperty('disabledPlugins') ? options.disabledPlugins : factorySettings.disabledPlugins;
    options.centerImages = options.hasOwnProperty('centerImages') ? options.centerImages : factorySettings.centerImages;
    options.autoLockImages = options.hasOwnProperty('autoLockImages') ? options.autoLockImages : factorySettings.autoLockImages;
    options.frameBackgroundColor = options.hasOwnProperty('frameBackgroundColor') ? options.frameBackgroundColor : factorySettings.frameBackgroundColor;
    options.frameThickness = options.hasOwnProperty('frameThickness') ? options.frameThickness : factorySettings.frameThickness;
    options.displayImageLoader = options.hasOwnProperty('displayImageLoader') ? options.displayImageLoader : factorySettings.displayImageLoader;
    options.enlargementThresholdEnabled = options.hasOwnProperty('enlargementThresholdEnabled') ? options.enlargementThresholdEnabled : factorySettings.enlargementThresholdEnabled;
    options.enlargementThreshold = options.hasOwnProperty('enlargementThreshold') ? options.enlargementThreshold : factorySettings.enlargementThreshold;
    options.displayedSizeThresholdEnabled = options.hasOwnProperty('displayedSizeThresholdEnabled') ? options.displayedSizeThresholdEnabled : factorySettings.displayedSizeThresholdEnabled;
    options.displayedSizeThreshold = options.hasOwnProperty('displayedSizeThreshold') ? options.displayedSizeThreshold : factorySettings.displayedSizeThreshold;
    options.zoomedSizeThresholdEnabled = options.hasOwnProperty('zoomedSizeThresholdEnabled') ? options.zoomedSizeThresholdEnabled : factorySettings.zoomedSizeThresholdEnabled;
    options.zoomedSizeThreshold = options.hasOwnProperty('zoomedSizeThreshold') ? options.zoomedSizeThreshold : factorySettings.zoomedSizeThreshold;
    options.downloadFolder = options.hasOwnProperty('downloadFolder') ? options.downloadFolder : factorySettings.downloadFolder;
    options.addDownloadOrigin = options.hasOwnProperty('addDownloadOrigin') ? options.addDownloadOrigin : factorySettings.addDownloadOrigin;
    options.addDownloadSize = options.hasOwnProperty('addDownloadSize') ? options.addDownloadSize : factorySettings.addDownloadSize;
    options.addDownloadDuration = options.hasOwnProperty('addDownloadDuration') ? options.addDownloadDuration : factorySettings.addDownloadDuration;
    options.addDownloadIndex = options.hasOwnProperty('addDownloadIndex') ? options.addDownloadIndex : factorySettings.addDownloadIndex;
    options.addDownloadCaption = options.hasOwnProperty('addDownloadCaption') ? options.addDownloadCaption : factorySettings.addDownloadCaption;
    options.replaceOriginalFilename = options.hasOwnProperty('replaceOriginalFilename') ? options.replaceOriginalFilename : factorySettings.replaceOriginalFilename;
    options.downloadFilename = options.hasOwnProperty('downloadFilename') ? options.downloadFilename : factorySettings.downloadFilename;
    options.useSeparateTabOrWindowForUnloadableUrlsEnabled = options.hasOwnProperty('useSeparateTabOrWindowForUnloadableUrlsEnabled') ? options.useSeparateTabOrWindowForUnloadableUrlsEnabled : factorySettings.useSeparateTabOrWindowForUnloadableUrlsEnabled;
    options.useSeparateTabOrWindowForUnloadableUrls = options.hasOwnProperty('useSeparateTabOrWindowForUnloadableUrls') ? options.useSeparateTabOrWindowForUnloadableUrls : factorySettings.useSeparateTabOrWindowForUnloadableUrls;

    // Used old showCaptions option for backwards compatibility
    var showCaptions = options.hasOwnProperty('showCaptions') ? options.showCaptions : true;
    options.captionLocation = options.hasOwnProperty('captionLocation') ? options.captionLocation : (showCaptions ? factorySettings.captionLocation : 'none');

    options.detailsLocation = options.hasOwnProperty('detailsLocation') ? options.detailsLocation : factorySettings.detailsLocation;
    options.fontSize = options.hasOwnProperty('fontSize') ? options.fontSize : factorySettings.fontSize;
    options.fontOutline = options.hasOwnProperty('fontOutline') ? options.fontOutline : factorySettings.fontOutline;
    options.belowPositionOffset = options.hasOwnProperty('belowPositionOffset') ? options.belowPositionOffset : factorySettings.belowPositionOffset;
    options.abovePositionOffset = options.hasOwnProperty('abovePositionOffset') ? options.abovePositionOffset : factorySettings.abovePositionOffset;

    // Action keys
    options.actionKey = options.hasOwnProperty('actionKey') ? options.actionKey : factorySettings.actionKey;
    options.toggleKey = options.hasOwnProperty('toggleKey') ? options.toggleKey : factorySettings.toggleKey;
    options.fullZoomKey = options.hasOwnProperty('fullZoomKey') ? options.fullZoomKey : factorySettings.fullZoomKey;
    options.copyImageKey = options.hasOwnProperty('copyImageKey') ? options.copyImageKey : factorySettings.copyImageKey;
    options.copyImageUrlKey = options.hasOwnProperty('copyImageUrlKey') ? options.copyImageUrlKey : factorySettings.copyImageUrlKey;
    options.hideKey = options.hasOwnProperty('hideKey') ? options.hideKey : factorySettings.hideKey;
    options.openImageInWindowKey = options.hasOwnProperty('openImageInWindowKey') ? options.openImageInWindowKey : factorySettings.openImageInWindowKey;
    options.openImageInTabKey = options.hasOwnProperty('openImageInTabKey') ? options.openImageInTabKey : factorySettings.openImageInTabKey;
    options.lockImageKey = options.hasOwnProperty('lockImageKey') ? options.lockImageKey : factorySettings.lockImageKey;
    options.saveImageKey = options.hasOwnProperty('saveImageKey') ? options.saveImageKey : factorySettings.saveImageKey;
    options.prevImgKey = options.hasOwnProperty('prevImgKey') ? options.prevImgKey : factorySettings.prevImgKey;
    options.nextImgKey = options.hasOwnProperty('nextImgKey') ? options.nextImgKey : factorySettings.nextImgKey;
    options.flipImageKey = options.hasOwnProperty('flipImageKey') ? options.flipImageKey : factorySettings.flipImageKey;
    options.closeKey = options.hasOwnProperty('closeKey') ? options.closeKey : factorySettings.closeKey;

    // debug
    options.debug = options.hasOwnProperty('debug') ? options.debug : factorySettings.debug;

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

// Return true if the url is part of an excluded site
function isExcludedSite(link) {
    let linkHostname = new URL(link)['hostname'];
    let excluded = !options.whiteListMode;
    for (let i = 0; i < options.excludedSites.length; i++) {

        // check if excluded site is included in link hostname
        // e.g:
        // link hostname = www.tiktok.com
        // excluded site = tiktok
        // => link excluded
        let es = options.excludedSites[i];
        if (linkHostname.indexOf(es) != -1) return excluded;
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

// enable/disable dark mode for Options & Popup
function chkDarkMode() {
    if (options.darkMode) $('body').addClass('darkmode');
    else $('body').removeClass('darkmode');
}
