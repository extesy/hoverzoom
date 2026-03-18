// Vinted page-world fetch/XHR bridge.
// Captures listing API payloads and replays wardrobe requests from the page
// so Vinted sees the same first-party cookies and request headers as the site.
if (typeof window.__hzVintedHooked === 'undefined') {
    window.__hzVintedHooked = true;

    function __hzVintedLog(message, error) {
        var fullMessage = '[vinted] ' + message + (error ? ': ' + error : '');

        if (typeof cLog === 'function') {
            cLog(fullMessage);
        } else if (window.console && typeof window.console.debug === 'function') {
            window.console.debug(fullMessage);
        }
    }

    function __hzVintedStore(text) {
        try { sessionStorage.setItem('hzVintedApiData', text); } catch (e) { __hzVintedLog('Failed to store intercepted API data', e); }
        try { document.dispatchEvent(new CustomEvent('hzVintedApiData')); } catch (e) { __hzVintedLog('Failed to dispatch intercepted API event', e); }
    }

    function __hzVintedStoreWardrobeResponse(requestId, payload) {
        var storageKey = 'hzVintedWardrobeResponse:' + requestId;

        try {
            sessionStorage.setItem(storageKey, JSON.stringify(payload));
        } catch (e) {
            __hzVintedLog('Failed to store wardrobe response for ' + requestId, e);
        }

        try {
            document.dispatchEvent(new CustomEvent('hzVintedWardrobeData', {
                detail: JSON.stringify({
                    requestId: requestId,
                    storageKey: storageKey
                })
            }));
        } catch (e) {
            __hzVintedLog('Failed to dispatch wardrobe response event for ' + requestId, e);
        }
    }

    function __hzVintedShouldIntercept(url) {
        return typeof url === 'string' && (
            url.indexOf('/api/v2/catalog/items') !== -1 ||
            url.indexOf('/api/v2/homepage/') !== -1
        );
    }

    // Wardrobe requests need to be issued from page context; a plain content-script
    // fetch gets a different default Accept header and Vinted rejects it.
    function __hzVintedFetchWardrobe(detail) {
        try {
            if (typeof detail === 'string') detail = JSON.parse(detail);
        } catch (e) {
            __hzVintedLog('Failed to parse wardrobe request detail', e);
            return;
        }

        if (!detail || !detail.requestId || !detail.url) return;

        _origFetch.call(window, detail.url, {
            credentials: 'include',
            cache: 'no-store',
            headers: {
                Accept: 'application/json, text/plain, */*,image/webp'
            }
        }).then(function (resp) {
            resp.text().then(function (text) {
                __hzVintedStoreWardrobeResponse(detail.requestId, {
                    ok: resp.ok,
                    status: resp.status,
                    text: text
                });
            }).catch(function (e) {
                __hzVintedLog('Failed to read wardrobe response body for ' + detail.requestId, e);
                __hzVintedStoreWardrobeResponse(detail.requestId, {
                    ok: false,
                    status: resp.status,
                    text: ''
                });
            });
        }).catch(function (e) {
            __hzVintedLog('Wardrobe fetch failed for ' + detail.requestId, e);
            __hzVintedStoreWardrobeResponse(detail.requestId, {
                ok: false,
                status: 0,
                text: ''
            });
        });
    }

    document.addEventListener('hzVintedWardrobeRequest', function (event) {
        __hzVintedFetchWardrobe(event.detail);
    });

    // Hook fetch()
    var _origFetch = window.fetch;
    window.fetch = function () {
        var url = (arguments[0] && arguments[0].url) || (typeof arguments[0] === 'string' ? arguments[0] : '') || '';
        var promise = _origFetch.apply(this, arguments);
        if (__hzVintedShouldIntercept(url)) {
            promise.then(function (resp) {
                try {
                    resp.clone().text().then(function (text) {
                        try {
                            if (text.indexOf('"photos"') !== -1 || text.indexOf('"blocks"') !== -1) {
                                __hzVintedStore(text);
                            }
                        } catch (e) {
                            __hzVintedLog('Failed to process intercepted fetch payload', e);
                        }
                    }).catch(function (e) {
                        __hzVintedLog('Failed to read intercepted fetch response body', e);
                    });
                } catch (e) {
                    __hzVintedLog('Failed to clone intercepted fetch response', e);
                }
            }).catch(function (e) {
                __hzVintedLog('Intercepted fetch request failed', e);
            });
        }
        return promise;
    };

    // Hook XMLHttpRequest
    var _origXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
        if (__hzVintedShouldIntercept(url)) {
            this.addEventListener('load', function () {
                try {
                    if (this.responseText &&
                        (this.responseText.indexOf('"photos"') !== -1 || this.responseText.indexOf('"blocks"') !== -1)) {
                        __hzVintedStore(this.responseText);
                    }
                } catch (e) {
                    __hzVintedLog('Failed to process intercepted XHR payload', e);
                }
            });
        }
        return _origXHROpen.apply(this, arguments);
    };
}
