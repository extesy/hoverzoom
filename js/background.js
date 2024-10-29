var options;

function cLog(msg) {
    if (options.debug && msg) {
        console.log(msg);
    }
}

// Performs an ajax request
function ajaxRequest(request, callback) {
    const response = request.response;
    const method = request.method;
    const filename = request.filename;
    const conflictAction = request.conflictAction;
    let xhr = new XMLHttpRequest();
    let url = request.url;

    if (response === 'DOWNLOAD') xhr.responseType = 'arraybuffer';

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                if (method === 'HEAD') {
                    callback({url:url, headers:xhr.getAllResponseHeaders()});
                } else {
                    switch (response) {
                        case 'DOWNLOAD':
                            const blobBin = new Blob([xhr.response], {type:'application/octet-stream'});
                            const blobUrl = URL.createObjectURL(blobBin);
                            downloadFile(blobUrl, filename, conflictAction, callback);
                            break;
                        case 'URL':
                            callback(xhr.responseURL);
                            break;
                        default:
                            callback(xhr.responseText);
                    }
                }
            } else {
                callback(null);
            }
        }
    }

    xhr.open(request.method, request.url, true);
    for (let i in request.headers) {
        xhr.setRequestHeader(request.headers[i].header, request.headers[i].value);
    }
    xhr.send(request.data);
}

function downloadFile(url, filename, conflictAction, callback) {
    cLog('downloadFile: ' + url);
    let currentId;
    chrome.downloads.onChanged.addListener(onChanged);
    chrome.downloads.download({url, filename, conflictAction, saveAs: false}, id => { currentId = id });

    function onChanged(delta) {
        if (!delta) return;
        cLog('onChanged: ' + delta.id);
        if (delta.id !== currentId) return;
        if (delta.state && delta.state.current !== 'in_progress') {
            cLog('onChanged delta.state: ' + delta.state);
            chrome.downloads.onChanged.removeListener(onChanged);
            try {
                URL.revokeObjectURL(url); // remove blob
            } catch {}
            // call callback only if download failed
            if (delta.state.current !== 'complete') {
                cLog('onChanged delta.error: ' + delta.error);
                // call callback iff download failed & user did NOT cancel
                if (delta.error.current !== 'USER_CANCELED') {
                    callback(true);
                }
            }
        }
    }
}

function onMessage(message, sender, callback) {
    switch (message.action) {
        case 'downloadFileBlob':
            /** 
            * direct URL download through Chrome API might be prohibited (e.g: Pixiv)
            * workaround:
            * 1. obtain ArrayBuffer from XHR request (GET URL)
            * 2. create Blob from ArrayBuffer
            * 3. download Blob URL through Chrome API
            */

            /*
            * Workaround for permissions.request not returning a promise in Firefox 
            * First checks if permissions are availble. If true, downloads file. If not, requests them.
            * Not as clean or effecient as just using 'permissions.request'.
            */
            cLog('downloadFileBlob: ' + message);
            chrome.permissions.contains({permissions: ['downloads']}, (contained) => {
                cLog('downloadFile contains: ' + contained);
                if (contained) {
                    ajaxRequest({method:'GET', response:'DOWNLOAD', url:message.url, filename:message.filename, conflictAction:message.conflictAction, headers:message.headers}, callback);
                } else {
                    chrome.permissions.request({permissions: ['downloads']}, (granted) => {
                        cLog('downloadFile granted: ' + granted);
                        if (granted) {
                            ajaxRequest({method:'GET', response:'DOWNLOAD', url:message.url, filename:message.filename, conflictAction:message.conflictAction, headers:message.headers}, callback);
                        }
                    })
                }
            });
            return true;
        case 'downloadFile':
            cLog('downloadFile: ' + message);
            /*
            * Workaround for permissions.request not returning a promise in Firefox 
            * First checks if permissions are availble. If true, downloads file. If not, requests them.
            * Not as clean or effecient as just using 'permissions.request'.
            */
            chrome.permissions.contains({permissions: ['downloads']}, (contained) => {
                cLog('downloadFile contains: ' + contained);
                if (contained) {
                    downloadFile(message.url, message.filename, message.conflictAction, callback);
                } else {
                    chrome.permissions.request({permissions: ['downloads']}, (granted) => {
                        cLog('downloadFile granted: ' + granted);
                        if (granted) {
                            downloadFile(message.url, message.filename, message.conflictAction, callback);
                        }
                    })
                }
            });
            return true;
        case 'ajaxGet':
            ajaxRequest({url:message.url, response:message.response, method:'GET', headers:message.headers}, callback);
            return true;
        case 'ajaxGetHeaders':
            ajaxRequest({url:message.url, response:message.response, method:'HEAD'}, callback);
            return true;
        case 'ajaxRequest':
            ajaxRequest(message, callback);
            return true;
        case 'showPageAction':
            // Firefox url is located at sender.url, copy sender.url to sender.tab.url
            if (!sender.tab.url && sender.url)
                sender.tab.url = sender.url
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
            manageHeadersRewrite();
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
            let url = message.createData.url;
            if (url.indexOf('facebook.com/photo/download') !== -1) {
                message.createData.url = 'data:text/html,<img src="' + url + '">';
            }
            chrome.windows.create(message.createData, function (window) {
                chrome.tabs.executeScript(window.tabs[0].id, {file:'js/viewWindow.js'});
            });
            break;
        case 'openViewTab':
            chrome.tabs.query({active: true}, function (tabs) {
                message.createData.index = tabs[0].index;
                if (!message.createData.active)
                    message.createData.index++;
                let url = message.createData.url;
                if (url.indexOf('facebook.com/photo/download') !== -1) {
                    message.createData.url = 'data:text/html,<img src="' + url + '">';
                }
                chrome.tabs.create(message.createData, function (tab) {
                    chrome.tabs.executeScript(tab.id, {file:'js/viewTab.js'});
                });
            });
            break;
        case 'updateViewWindow':
            chrome.windows.getCurrent(window => { chrome.windows.update(window.id, { width:message.updateData.width, height:message.updateData.height, top:message.updateData.top, left:message.updateData.left }) });
            break;
        case 'storeHeaderSettings':
            storeHeaderSettings(message);
            return true;
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

function init() {
    // Load options
    options = loadOptions();

    // Bind events
    chrome.runtime.onMessage.addListener(onMessage);

    manageHeadersRewrite();
}

// Add or remove web request listeners
function manageHeadersRewrite() {
    if (!chrome.webRequest) return; // not supported on Firefox

    if (options.allowHeadersRewrite) {
        // check that permissions are granted, otherwise remove listeners
        chrome.permissions.contains({permissions: ['webRequest','webRequestBlocking']}, function (granted) {
            if (granted)
                addWebRequestListeners();
            else
                removeWebRequestListeners();
        });
    } else {
        chrome.permissions.remove({permissions: ['webRequest','webRequestBlocking']}, function (removed) {
            if (removed)
                removeWebRequestListeners();
            else
                addWebRequestListeners();
        });
    }
}

// Store HZ+ dates of installation & last update
chrome.runtime.onInstalled.addListener((details) => {
    const reason = details.reason;
    let d = new Date();
    let options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };

    switch (reason) {
        case 'install':
            localStorage['HoverZoomInstallation'] = d.toLocaleDateString(undefined, options);
            break;
        case 'update':
            localStorage['HoverZoomLastUpdate'] = d.toLocaleDateString(undefined, options);
            break;
        case 'chrome_update':
        case 'shared_module_update':
        default:
            // Other install events within the browser
            break;
    }
})

/**
* - store request's header(s) setting(s) = modification(s) to be applied to request's header(s) just before sending request to server
*   e.g: add/modify "Origin" header to deal with CORS limitations
* - store response's header(s) setting(s) = modification(s) to be applied to response's header(s) just after receiving response from server
*   e.g: add/modify "Access-Control-Allow-Origin" header so browser allows content display
*/
function storeHeaderSettings(message) {
    /**
    * check that:
    * - header(s) rewrite is allowed
    * and
    * - permissions are granted
    */
    if (!options.allowHeadersRewrite) {
        return;
    }

    chrome.permissions.contains({permissions: ['webRequest','webRequestBlocking']}, function (granted) {
        if (granted) {
            let hoverZoomHeaderSettings = sessionStorage.getItem('HoverZoomHeaderSettings') || '[]';
            hoverZoomHeaderSettings = JSON.parse(hoverZoomHeaderSettings);
            let index = hoverZoomHeaderSettings.findIndex(s => s.plugin === message.plugin);
            if (index !== -1) hoverZoomHeaderSettings.splice(index, 1); // remove old settings
            let s = {};
            s.plugin = message.plugin;
            s.settings = message.settings;
            hoverZoomHeaderSettings.push(s);
            sessionStorage.setItem('HoverZoomHeaderSettings', JSON.stringify(hoverZoomHeaderSettings));
        }
    });
}

// update request header(s) just before sending
function updateRequestHeaders(e) {
    let settings = findHeaderSettings(e.url, "request");
    if (!settings) return;

    // check if update must be skipped because of initiator
    if (settings.skipInitiator && e.initiator && e.initiator.indexOf(settings.skipInitiator) !== -1) return;

    return { requestHeaders: updateHeaders(e.requestHeaders, settings) };
}

// update response header(s) just after receiving
function updateResponseHeaders(e) {
    let settings = findHeaderSettings(e.url, "response");
    if (!settings) return;

    // check if update must be skipped because of initiator
    if (settings.skipInitiator && e.initiator && e.initiator.indexOf(settings.skipInitiator) !== -1) return;

    return { responseHeaders: updateHeaders(e.responseHeaders, settings) };
}

// find header(s) setting(s) associated with url that triggered the listener
function findHeaderSettings(url, requestOrResponse) {
    let hoverZoomHeaderSettings = sessionStorage.getItem('HoverZoomHeaderSettings') || '[]';
    hoverZoomHeaderSettings = JSON.parse(hoverZoomHeaderSettings);

    let settings = [];
    url = url.toLowerCase();
    hoverZoomHeaderSettings.forEach(s => s.settings.forEach(s2 => { if (s2.type === requestOrResponse && s2.urls.find(u => url.indexOf(u) !== -1) !== undefined) settings.push(s2) }))
    return settings[0];
}

// update header(s) according to plug-in settings
function updateHeaders(headers, settings) {
    settings.headers.forEach(h => {
        /**
        * types of update:
        * - 'remove':  remove header
        * - 'replace': replace header, if header does not exist then do nothing
        * - 'add':     add header, if header already exists then replace it
        */
        if (h.typeOfUpdate === 'remove') {
            let index = headers.findIndex(rh => rh.name.toLowerCase() === h.name.toLowerCase());
            if (index !== -1) headers.splice(index, 1);
        }
        if (h.typeOfUpdate === 'replace') {
            let index = headers.findIndex(rh => rh.name.toLowerCase() === h.name.toLowerCase());
            if (index !== -1) headers[index] = { 'name':h.name, 'value':h.value };
        }
        if (h.typeOfUpdate === 'add') {
            let index = headers.findIndex(rh => rh.name.toLowerCase() === h.name.toLowerCase());
            if (index !== -1) headers[index] = { 'name':h.name, 'value':h.value };
            else headers.push( { 'name':h.name, 'value':h.value } );
        }
    })
    return headers;
}

/** 
* add listeners for web requests:
* - onBeforeSendHeaders
* - onHeadersReceived
* so they can be edited on-the-fly to enable API calls from plug-ins
* https://developer.chrome.com/docs/extensions/reference/webRequest/
* https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest
*/

function addWebRequestListeners() {
    if (!chrome.webRequest.onBeforeSendHeaders.hasListener(updateRequestHeaders)) {
        chrome.webRequest.onBeforeSendHeaders.addListener(updateRequestHeaders, { urls : ["<all_urls>"] }, [
            'blocking',
            'requestHeaders',
            chrome.webRequest.OnSendHeadersOptions.EXTRA_HEADERS,
        ].filter(Boolean));
    }
    if (!chrome.webRequest.onHeadersReceived.hasListener(updateResponseHeaders)){
        chrome.webRequest.onHeadersReceived.addListener(updateResponseHeaders, { urls : ["<all_urls>"] }, [
            'blocking',
            'responseHeaders',
            chrome.webRequest.OnSendHeadersOptions.EXTRA_HEADERS,
        ].filter(Boolean));
    }
    
}

/**
* remove listeners for web requests:
* - onBeforeSendHeaders
* - onHeadersReceived
* also remove headers settings since they are not used anymore
*/
function removeWebRequestListeners() {
    if (chrome.webRequest.onBeforeSendHeaders.hasListener(updateRequestHeaders))
        chrome.webRequest.onBeforeSendHeaders.removeListener(updateRequestHeaders);
    if (chrome.webRequest.onHeadersReceived.hasListener(updateResponseHeaders))
        chrome.webRequest.onHeadersReceived.removeListener(updateResponseHeaders);

    sessionStorage.removeItem('HoverZoomHeaderSettings');
}

init();
