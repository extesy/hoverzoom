// True if the current version of the extension has something to show in an update notification
var hasReleaseNotes = false;

var options, _gaq;

// Performs an ajax request
function ajaxRequest(request, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                callback(xhr.responseText);
            } else {
                callback(null);
            }
        }
    };
    xhr.open(request.method, request.url, true);
    for (var i in request.headers) {
        xhr.setRequestHeader(request.headers[i].header, request.headers[i].value);
    }
    xhr.send(request.data);
}

function onMessage(message, sender, callback) {
    switch (message.action) {
        case 'ajaxGet':
            ajaxRequest({url:message.url, method:'GET'}, callback);
            return true;
        case 'ajaxRequest':
            ajaxRequest(message, callback);
            return true;
        case 'showPageAction':
            showPageAction(sender.tab);
            callback();
            return true;
        case 'addUrlToHistory':
            chrome.permissions.contains({permissions: ['history']}, function(granted) {
                if (granted) {
                    chrome.history.addUrl({url:message.url});
                }
            });
            break;
        case 'getOptions':
            callback(options);
            return true;
        case 'setOption':
            options[message.name] = message.value;
            localStorage.options = JSON.stringify(options);
            sendOptions(message.options);
            break;
        case 'optionsChanged':
            options = message.options;
            break;
        case 'saveOptions':
            localStorage.options = JSON.stringify(message.options);
            sendOptions(message.options);
            break;
        case 'setItem':
            localStorage.setItem(message.id, message.data);
            break;
        case 'getItem':
            callback(localStorage.getItem(message.id));
            return true;
        case 'removeItem':
            localStorage.removeItem(message.id);
            break;
        case 'openViewWindow':
            chrome.windows.create(message.createData, function (window) {
                chrome.tabs.executeScript(window.tabs[0].id, {file:'js/viewWindow.js'});
            });
            break;
        case 'openViewTab':
            chrome.tabs.getSelected(null, function (currentTab) {
                message.createData.index = currentTab.index;
                if (!message.createData.active)
                    message.createData.index++;
                chrome.tabs.create(message.createData, function (tab) {
                    chrome.tabs.executeScript(tab.id, {file:'js/viewTab.js'});
                });
            });
            break;
        case 'trackEvent':
            if (options.enableStats && _gaq) {
                _gaq.push(['_trackEvent', message.event.category, message.event.action, message.event.label]);
            }
            break;
    }
}

function showPageAction(tab) {
    if (!tab) {
        return;
    }
    if (!options.extensionEnabled || isExcludedSite(tab.url)) {
        chrome.pageAction.setIcon({tabId:tab.id, path:'../images/icon19d.png'});
    } else {
        chrome.pageAction.setIcon({tabId:tab.id, path:'../images/icon19.png'});
    }
    chrome.pageAction.show(tab.id);
}

// Sets up anonymous stats
function setUpStats() {
    _gaq = _gaq || [];
    _gaq.push(['_setAccount', 'UA-30586301-5']);
    _gaq.push(['_setSampleRate', '0.1']);
    _gaq.push(['_trackPageview']);

    (function () {
        var ga = document.createElement('script');
        ga.type = 'text/javascript';
        ga.async = true;
        ga.src = 'https://ssl.google-analytics.com/ga.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(ga);
    })();
}

// Report options stats
// No user data (browser history, etc) is reported
function optionsStats() {
    _gaq.push(['_trackEvent', 'Options', 'extensionEnabled', options.extensionEnabled.toString()]);
    _gaq.push(['_trackEvent', 'Options', 'pageActionEnabled', options.pageActionEnabled.toString()]);
    _gaq.push(['_trackEvent', 'Options', 'updateNotifications', options.updateNotifications.toString()]);
    _gaq.push(['_trackEvent', 'Options', 'mouseUnderlap', options.mouseUnderlap.toString()]);
    _gaq.push(['_trackEvent', 'Options', 'showCaptions', options.showCaptions.toString()]);
    _gaq.push(['_trackEvent', 'Options', 'showHighRes', options.showHighRes.toString()]);
    _gaq.push(['_trackEvent', 'Options', 'addToHistory', options.addToHistory.toString()]);
    _gaq.push(['_trackEvent', 'Options', 'alwaysPreload', options.alwaysPreload.toString()]);
    _gaq.push(['_trackEvent', 'Options', 'showWhileLoading', options.showWhileLoading.toString()]);
    _gaq.push(['_trackEvent', 'Options', 'whiteListMode', options.whiteListMode.toString()]);
    _gaq.push(['_trackEvent', 'Options', 'displayDelay', options.displayDelay.toString()]);
    _gaq.push(['_trackEvent', 'Options', 'fadeDuration', options.fadeDuration.toString()]);
    _gaq.push(['_trackEvent', 'Options', 'picturesOpacity', options.picturesOpacity.toString()]);
}

// Report miscellaneous stats
// No user data (browser history, etc) is reported
function miscStats() {
    _gaq.push(['_trackEvent', 'Misc', 'extensionVersion', chrome.app.getDetails().version]);
    _gaq.push(['_trackEvent', 'Misc', 'downloadedFrom', 'Chrome Web Store']);
}

// Checks if the extension has been updated.
// Displays a notification if necessary.
function checkUpdate() {
    var currVersion = chrome.app.getDetails().version,
        prevVersion = localStorage.hzVersion;
    if (hasReleaseNotes && options.updateNotifications && currVersion != prevVersion && typeof prevVersion != 'undefined') {
        showUpdateNotification();
    }
    localStorage.hzVersion = currVersion;
}

function init() {
    // Load options
    options = loadOptions();

    // Bind events
    chrome.runtime.onMessage.addListener(onMessage);

    // Anonymous stats
    if (options.enableStats && navigator.appVersion.indexOf("RockMelt") == -1) {
        setUpStats();
        miscStats();
        optionsStats();
    }

    checkUpdate();
}

init();
