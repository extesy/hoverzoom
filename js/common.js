// Load options from local storage
// Return default values if none exist
function loadOptions() {
    var options;
    if (localStorage.options == null) {
        localStorage.options = '{}';
    }
    options = JSON.parse(localStorage.options);

    options.extensionEnabled = options.hasOwnProperty('extensionEnabled') ? options.extensionEnabled : true;
    options.zoomVideos = options.hasOwnProperty('zoomVideos') ? options.zoomVideos : true;
    options.muteVideos = options.hasOwnProperty('muteVideos') ? options.muteVideos : true;
    options.pageActionEnabled = options.hasOwnProperty('pageActionEnabled') ? options.pageActionEnabled : true;
    options.showCaptions = options.hasOwnProperty('showCaptions') ? options.showCaptions : true;
    options.showHighRes = options.hasOwnProperty('showHighRes') ? options.showHighRes : false;
    options.galleriesMouseWheel = options.hasOwnProperty('galleriesMouseWheel') ? options.galleriesMouseWheel : true;
    options.addToHistory = options.hasOwnProperty('addToHistory') ? options.addToHistory : false;
    options.alwaysPreload = options.hasOwnProperty('alwaysPreload') ? options.alwaysPreload : false;
    options.displayDelay = options.hasOwnProperty('displayDelay') ? options.displayDelay : 100;
    options.fadeDuration = options.hasOwnProperty('fadeDuration') ? options.fadeDuration : 200;
    options.excludedSites = options.hasOwnProperty('excludedSites') ? options.excludedSites : [];
    options.whiteListMode = options.hasOwnProperty('whiteListMode') ? options.whiteListMode : false;
    options.picturesOpacity = options.hasOwnProperty('picturesOpacity') ? options.picturesOpacity : 1;
    options.showWhileLoading = options.hasOwnProperty('showWhileLoading') ? options.showWhileLoading : true;
    //options.expAlwaysFullZoom = options.hasOwnProperty('expAlwaysFullZoom') ? options.expAlwaysFullZoom : false;
    options.mouseUnderlap = options.hasOwnProperty('mouseUnderlap') ? options.mouseUnderlap : true;
    options.updateNotifications = options.hasOwnProperty('updateNotifications') ? options.updateNotifications : true;
    options.filterNSFW = options.hasOwnProperty('filterNSFW') ? options.filterNSFW : false;
    options.enableGalleries = options.hasOwnProperty('enableGalleries') ? options.enableGalleries : true;
    options.enableStats = options.hasOwnProperty('enableStats') ? options.enableStats : false;

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
            chrome.tabs.getAllInWindow(windows[i].id, function (tabs) {
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

function showUpdateNotification() {
    if (chrome.notifications) {
        var options = {
                type: 'list',
                title: 'Hover Zoom+ has been updated',
                message: '',
                iconUrl: '/images/icon32.png',
                items: [
                    { title: "Imgur gifv support", message: ""},
                    { title: "Fix for HTTPS Imgur albums", message: ""}
                ]
            };
        chrome.notifications.create('Hover Zoom+', options, function(id) { });
    }
}
