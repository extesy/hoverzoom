const factorySettings = {
    extensionEnabled: true,
    darkMode: false,
    zoomFactor: 1,
    maxWidth: 0,
    maxHeight: 0,
    zoomVideos: true,
    videoPositionStep: 10,
    muteVideos: false,
    videoTimestamp: false,
    videoVolume: 0.25,
    playAudio: false,
    audioVolume: 0.25,
    mouseClickHoldTime: 250,
    lockImageZoomFactorEnabled: true,
    lockImageZoomDefaultEnabled: false,
    pageActionEnabled: true,
    showHighRes: true,
    galleriesMouseWheel: true,
    disableMouseWheelForVideo: false,
    alwaysPreload: false,
    displayDelay: 100,
    displayDelayVideo: 500,
    fadeDuration: 200,
    excludedSites: [],
    whiteListMode: false,
    picturesOpacity: 1,
    showWhileLoading: true,
    mouseUnderlap: true,
    hideMouseCursor: false,
    hideMouseCursorDelay: 500,
    filterNSFW: false,
    enableGalleries: true,
    enableNoFocusMsg: false,
    viewerShadowEnabled: true,
    captionDetailShadowEnabled: true,
    ambilightEnabled: false,
    ambilightHaloSize: 0.1,
    ambilightBackgroundOpacity: 0.9,
    disabledPlugins: [],
    imagePaddingSize: 10,
    fullZoomHidesDetailsCaptions: false,
    statusBarOverlap: false,
    hScrollBarOverlap: false,
    centerImages: false,
    autoLockImages: false,
    frameBackgroundColor: "#ffffff",
    frameThickness: 4,
    belowPositionOffset: 0,
    belowPositionOffsetUnit: 'percent',
    abovePositionOffset: 0,
    abovePositionOffsetUnit: 'percent',
    captionOpacity: 1,
    detailsOpacity: 1,
    useClipboardNameWhenSaving: false,
    displayImageLoader: false,
    enlargementThresholdEnabled: true,
    enlargementThreshold: 2,
    displayedSizeThresholdEnabled: true,
    displayedSizeThreshold: 300,
    zoomedSizeThresholdEnabled: true,
    zoomedSizeThreshold: 100,
    downloadFolder: '',
    addDownloadOrigin: false,
    addDownloadSize: false,
    addDownloadDuration: false,
    addDownloadIndex: false,
    addDownloadCaption: false,
    replaceOriginalFilename: false,
    downloadFilename: '',
    useSeparateTabOrWindowForUnloadableUrlsEnabled: false,
    useSeparateTabOrWindowForUnloadableUrls: 'window',
    captionLocation: 'below',
    detailsLocation: 'none',
    showDetailFilename: true,
    showDetailHost: true,
    showDetailLastModified: true,
    showDetailExtension: true,
    showDetailContentLength: true,
    showDetailDuration: true,
    showDetailScale: true,
    showDetailRatio: true,
    showDetailDimensions: true,
    rightShortClickAndHold: false,
    middleShortClickAndHold: false,
    rightShortClick: false,
    middleShortClick: false,
    fontSize: 11,
    fontOutline: false,
    actionKey: 0,
    toggleKey: 69,
    fullZoomKey: 90,
    copyImageKey: 67,
    copyImageUrlKey: 85,
    hideKey: 88,
    banKey: 66,
    openImageInWindowKey: 87,
    openImageInTabKey: 84,
    lockImageKey: 76,
    saveImageKey: 83,
    prevImgKey: 37,
    nextImgKey: 39,
    flipImageKey: 70,
    rotateImageKey: 82,
    closeKey: 27,
    debug: false
}

async function migrateOptions() {
    const result = await optionsStorageGet('extensionEnabled');
    if (result !== undefined && result !== null)
        return;
    const options = localStorage && localStorage.options ? JSON.parse(localStorage.options) : factorySettings;
    await optionsStorageSet(options);
}

// Load options from local storage
// Return default values if none exist
async function loadOptions() {
    await migrateOptions();
    return await optionsStorageGet(factorySettings);
}

// Send options to all tabs and extension pages
function sendOptions(options) {
    var request = {action: 'optionsChanged', 'options': options};

    // Send options to all tabs
    chrome.windows.getAll(null, function (windows) {
        for (var i = 0; i < windows.length; i++) {
            chrome.tabs.query({active: true, windowId: windows[i].id}, function (tabs) {
                for (var j = 0; j < tabs.length; j++) {
                    const tab = tabs[j];
                    if (tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
                        chrome.tabs.sendMessage(tab.id, request, function(response) {
                            // Ignore errors that occur when the receiving end doesn't exist
                            let lastError = chrome.runtime.lastError;
                        });
                    }
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

function loadKeys(sel) {
    $('<option value="0">None</option>').appendTo(sel);
    $('<option value="-1">Right Click (Hold)</option>').appendTo(sel);
    $('<option value="-2">Middle Click (Hold)</option>').appendTo(sel);
    if (sel.attr('id') != 'selHideKey' && sel.attr('id') != 'selFullZoomKey' && sel.attr('id') != 'selActionKey' && sel.attr('id') != 'selToggleKey') {
        $('<option value="-3">Right Click</option>').appendTo(sel);
        $('<option value="-4">Middle Click</option>').appendTo(sel);
    }
    if (sel.attr('id') != 'selOpenImageInTabKey')
        $('<option value="16">Shift</option>').appendTo(sel);
    $('<option value="17">Ctrl</option>').appendTo(sel);
    $('<option value="18">Alt</option>').appendTo(sel);
    $('<option value="13">Enter</option>').appendTo(sel);
    if (navigator.appVersion.indexOf('Macintosh') > -1) {
        $('<option value="91">Command</option>').appendTo(sel);
    }
    for (var i = 65; i < 91; i++) {
        $('<option value="' + i + '">&#' + i + ';</option>').appendTo(sel);
    }
    $('<option value="220">\\</option>').appendTo(sel);
    for (var i = 112; i < 124; i++) {
        $('<option value="' + i + '">F' + (i - 111) + '</option>').appendTo(sel);
    }
    $('<option value="27">Escape</option>').appendTo(sel);
    $('<option value="33">Page Up</option>').appendTo(sel);
    $('<option value="34">Page Down</option>').appendTo(sel);
    $('<option value="35">End</option>').appendTo(sel);
    $('<option value="36">Home</option>').appendTo(sel);
    $('<option value="37">Left</option>').appendTo(sel);
    $('<option value="38">Up</option>').appendTo(sel);
    $('<option value="39">Right</option>').appendTo(sel);
    $('<option value="40">Down</option>').appendTo(sel);
    $('<option value="45">Insert</option>').appendTo(sel);
    $('<option value="46">Delete</option>').appendTo(sel);
}
