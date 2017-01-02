// True if the current version of the extension has something to show in an update notification
var hasReleaseNotes = false;

var options;

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
            var url = message.createData.url;
            if (url.indexOf('facebook.com/photo/download') != -1) {
                message.createData.url = 'data:text/html,<img src="' + url + '">';
            }
            chrome.windows.create(message.createData, function (window) {
                chrome.tabs.executeScript(window.tabs[0].id, {file:'js/viewWindow.js'});
            });
            break;
        case 'openViewTab':
            chrome.tabs.getSelected(null, function (currentTab) {
                message.createData.index = currentTab.index;
                if (!message.createData.active)
                    message.createData.index++;
                var url = message.createData.url;
                if (url.indexOf('facebook.com/photo/download') != -1) {
                    message.createData.url = 'data:text/html,<img src="' + url + '">';
                }
                chrome.tabs.create(message.createData, function (tab) {
                    chrome.tabs.executeScript(tab.id, {file:'js/viewTab.js'});
                });
            });
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

    checkUpdate();
}

init();
