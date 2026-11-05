if ('function' === typeof importScripts) {
    importScripts('tools.js');
    importScripts('common.js');
}

let options;

function cLog(msg) {
    if (options.debug && msg) {
        console.log(msg);
    }
}

// Performs an ajax request
async function ajaxRequest(request, sendResponse) {
    const response = request.response;
    const method = request.method;
    const filename = request.filename;
    const conflictAction = request.conflictAction;

    // Prepare fetch options
    const fetchOptions = {
        method: request.method,
        headers: {},
        body: request.data
    };

    // plugins may need the user's session cookies of the requested host
    if (request.credentials) {
        fetchOptions.credentials = request.credentials;
    }

    for (let i in request.headers) {
        fetchOptions.headers[request.headers[i].header] = request.headers[i].value;
    }

    try {
        const fetchResponse = await fetch(request.url, fetchOptions);

        if (fetchResponse.ok) {
            if (method === 'HEAD') {
                const headers = {};
                fetchResponse.headers.forEach((value, key) => {
                    headers[key] = value;
                });
                sendResponse({url: request.url, headers: headers});
            } else {
                switch (response) {
                    /**
                     * direct URL download through Chrome API might be prohibited (e.g: Pixiv)
                     * workaround:
                     * 1. obtain ArrayBuffer from XHR request (GET URL)
                     * 2. create Blob from ArrayBuffer
                     * 3. download Blob URL through Chrome API
                     */
                    case 'DOWNLOAD':
                        const arrayBuffer = await fetchResponse.arrayBuffer();
                        const contentType = fetchResponse.headers.get('content-type') || 'application/octet-stream';
                        const blobBin = new Blob([arrayBuffer], { type: contentType }); 
                        
                        // For ajax-based image loading, Firefox needs an Object URL, Chrome needs a Data URI
                        const blobUrl = isChromiumBased ? await blobToDataURI(blobBin) : URL.createObjectURL(blobBin);
                        downloadFile(blobUrl, filename, conflictAction, sendResponse);
                        break;
                    case 'URL':
                        sendResponse(fetchResponse.url);
                        break;
                    default:
                        const text = await fetchResponse.text();
                        sendResponse(text);
                }
            }
        } else {
            sendResponse(null);
        }
    } catch (error) {
        cLog(error);
        sendResponse(null);
    }
}

function blobToDataURI(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result); // reader.result contains the Data URI
        };
        reader.onerror = (error) => {
            reject(error);
        };
        // Read the Blob as a Data URI (Base64 encoded)
        reader.readAsDataURL(blob);
    });
}

function downloadFile(url, filename, conflictAction, sendResponse) {
    cLog('downloadFile: ' + url);
    let currentId;
    chrome.downloads.onChanged.addListener(onChanged);
    chrome.downloads.download({url, filename, conflictAction}, id => { currentId = id });

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
                    sendResponse(true);
                }
            }
        }
    }
}

async function onMessage(message, sender, sendResponse) {
    options = await loadOptions();
    switch (message.action) {
        case 'downloadFileBlob':
            cLog('downloadFileBlob: ' + message);
            await ajaxRequest({
                method: 'GET',
                response: 'DOWNLOAD',
                url: message.url,
                filename: message.filename,
                conflictAction: message.conflictAction,
                headers: message.headers
            }, sendResponse);
            break;
        case 'downloadFile':
            cLog('downloadFile: ' + message);
            downloadFile(message.url, message.filename, message.conflictAction, sendResponse);
            break;
        case 'ajaxGet':
            await ajaxRequest({
                method: 'GET',
                response: message.response,
                url: message.url,
                headers: message.headers,
                credentials: message.credentials
            }, sendResponse);
            break;
        case 'getPermissionsContains':
            chrome.permissions.contains({permissions: message.permissions}, function(granted) {
                sendResponse(granted);
            });
            break;
        case 'ajaxGetHeaders':
            await ajaxRequest({
                method: 'HEAD',
                response: message.response,
                url: message.url
            }, sendResponse);
            break;
        case 'ajaxRequest':
            await ajaxRequest(message, sendResponse);
            break;
        case 'showPageAction':
            // Firefox url is located at sender.url, copy sender.url to sender.tab.url
            if (!sender.tab.url && sender.url)
                sender.tab.url = sender.url
            showPageAction(sender.tab);
            sendResponse();
            break;
        case 'addUrlToHistory':
            chrome.permissions.contains({permissions: ['history']}, function(granted) {
                if (granted) {
                    chrome.history.addUrl({url:message.url});
                }
            });
            break;
        case 'visitedLinksAdd':
            await visitedLinksAdd(message.urls);
            sendResponse();
            break;
        case 'visitedLinksQuery':
            sendResponse(await visitedLinksQuery(message.urls));
            break;
        case 'visitedLinksFetchCss':
            sendResponse(await visitedLinksFetchCss(message.url));
            break;
        case 'visitedLinksClear':
            await visitedLinksClear();
            sendResponse();
            break;
        case 'getOptions':
            sendResponse(options);
            break;
        case 'setItem':
            const items = {};
            items[message.id] = message.data;
            await sessionStorageSet(items);
            break;
        case 'getItem':
            await sessionStorageGet(message.id).then((result) => {
                sendResponse(result);
            });
            break;
        case 'removeItem':
            await sessionStorageRemove(message.id);
            break;
        case 'openViewWindow':
            let url = message.createData.url;
            if (url.indexOf('facebook.com/photo/download') !== -1) {
                message.createData.url = 'data:text/html,<img src="' + url + '">';
            }
            chrome.windows.create(message.createData, function (window) {
                chrome.scripting.executeScript({
                    // target: {tabId: window.tabs[0].id},
                    files: ['js/viewWindow.js']
                });
            });
            break;
        case 'openViewTab':
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                message.createData.index = tabs[0].index + 1;
                let url = message.createData.url;
                if (url.indexOf('facebook.com/photo/download') !== -1) {
                    message.createData.url = 'data:text/html,<img src="' + url + '">';
                }
                chrome.tabs.create(message.createData, function (tab) {
                    chrome.scripting.executeScript({
                        // target: {tabId: window.tabs[0].id},
                        files: ['js/viewTab.js']
                    });
                });
            });
            break;
        // case 'updateViewWindow':
        //     chrome.windows.getCurrent(window => {
        //         chrome.windows.update(window.id, {
        //             width: message.updateData.width,
        //             height: message.updateData.height,
        //             top: message.updateData.top,
        //             left: message.updateData.left
        //         })
        //     });
        //     break;
        case 'banImage':
            await banImage(message);
            break;
        case 'resetBannedImages':
            await resetBannedImages();
            break;
        case 'isImageBanned':
            sendResponse(await isImageBanned(message));
            break;
    }
}

function showPageAction(tab) {
    if (!tab) {
        return;
    }
    if (!options.extensionEnabled || isExcludedSite(tab.url)) {
        chrome.action.setIcon({tabId: tab.id, path: '../images/icon19d.png'});
    } else {
        chrome.action.setIcon({tabId: tab.id, path: '../images/icon19e.png'});
    }
 }

// Add url of image, video or audio track to the banlist, so it will not be zoomed again.
async function banImage(message) {
    const url = message.url;
    if (!url) return;

    // store urls to ban in background page local storage so theys are shared by all pages & will survive browser restart
    let bannedUrls = (await localStorageGet('HoverZoomBannedUrls')) || '{}';
    try {
        let update = false;
        bannedUrls = JSON.parse(bannedUrls);
        if (url && !bannedUrls[url]) {
            bannedUrls[url] = { 'location' : message.location };
            update = true;
        }
        if (update) {
            await localStorageSet({'HoverZoomBannedUrls': JSON.stringify(bannedUrls)});
        }
    } catch {}
}

// clear list of banned image, video or audio track urls
async function resetBannedImages() {
    await localStorageRemove('HoverZoomBannedUrls');
}

// Check if url of image, video or audio track belongs to the banlist.
async function isImageBanned(message) {
    const url = message.url;
    let bannedUrls = (await localStorageGet('HoverZoomBannedUrls')) || '{}';
    try {
        bannedUrls = JSON.parse(bannedUrls);
    } catch { return false; }
    return bannedUrls[url];
}

// Bind events, has to be a top-level command in service worker
// Urls whose media was previewed, used to mark links as visited (see js/visitedLinks.js).
// Stored as {url: lastSeenEpochSeconds} in storage.local, capped to the most recent VISITED_LINKS_MAX entries.
const VISITED_LINKS_KEY = 'hzVisitedLinks';
const VISITED_LINKS_MAX = 50000;
let visitedLinks = null;
let visitedLinksSaveTimer = null;

async function visitedLinksLoad() {
    if (!visitedLinks) {
        const result = await chrome.storage.local.get(VISITED_LINKS_KEY);
        visitedLinks = visitedLinks || new Map(Object.entries(result[VISITED_LINKS_KEY] || {}));
    }
    return visitedLinks;
}

function visitedLinksSave() {
    if (visitedLinksSaveTimer) return;
    visitedLinksSaveTimer = setTimeout(async () => {
        visitedLinksSaveTimer = null;
        if (visitedLinks.size > VISITED_LINKS_MAX) {
            const sorted = Array.from(visitedLinks.entries()).sort((a, b) => b[1] - a[1]).slice(0, VISITED_LINKS_MAX);
            visitedLinks = new Map(sorted);
        }
        await chrome.storage.local.set({[VISITED_LINKS_KEY]: Object.fromEntries(visitedLinks)});
    }, 1000);
}

async function visitedLinksAdd(urls) {
    if (!Array.isArray(urls) || !urls.length) return;
    const map = await visitedLinksLoad();
    const now = Math.floor(Date.now() / 1000);
    for (const url of urls) if (typeof url === 'string' && url.length < 2048) map.set(url, now);
    visitedLinksSave();
}

async function visitedLinksQuery(urls) {
    if (!Array.isArray(urls)) return [];
    const map = await visitedLinksLoad();
    return urls.filter(url => map.has(url));
}

async function visitedLinksClear() {
    visitedLinks = new Map();
    await chrome.storage.local.remove(VISITED_LINKS_KEY);
}

// Cross-origin stylesheets can't be read by content scripts, so their :visited rules are fetched here.
const visitedLinksCssCache = new Map();
async function visitedLinksFetchCss(url) {
    if (typeof url !== 'string' || !/^https?:\/\//.test(url)) return '';
    if (visitedLinksCssCache.has(url)) return visitedLinksCssCache.get(url);
    let text = '';
    try {
        const response = await fetch(url, {credentials: 'omit'});
        const type = response.headers.get('content-type') || '';
        if (response.ok && (type === '' || type.includes('css') || type.includes('text/plain'))) text = await response.text();
    } catch (e) {
        cLog('visitedLinksFetchCss failed: ' + url);
    }
    if (visitedLinksCssCache.size > 10) visitedLinksCssCache.delete(visitedLinksCssCache.keys().next().value);
    visitedLinksCssCache.set(url, text);
    return text;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    onMessage(request, sender, sendResponse);
    return true;
});

// https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension
const keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 20e3);
chrome.runtime.onStartup.addListener(keepAlive);
keepAlive();
