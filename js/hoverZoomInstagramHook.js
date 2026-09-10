// Instagram page-world bridge.
//
// The instagram.com CSP blocks inline scripts, so the plugin injects this file as a web accessible
// resource instead. It only transports data: it captures the API payloads the page receives and
// replays the requests the extension asks for, both with the page's own session.
(function () {
    if (window.__hzInstagramHooked) return;
    window.__hzInstagramHooked = true;

    const APP_ID = '936619743392459';
    const MAX_PAYLOAD = 4 * 1024 * 1024;

    function notify(url, text) {
        try {
            if (!text || text.length > MAX_PAYLOAD) return;
            if (text.indexOf('image_versions2') === -1 && text.indexOf('display_url') === -1 &&
                text.indexOf('carousel_media') === -1 && text.indexOf('video_versions') === -1 &&
                text.indexOf('"tray"') === -1 && text.indexOf('reels_media') === -1 &&
                text.indexOf('profile_pic_url') === -1) {
                return;
            }
            document.dispatchEvent(new CustomEvent('hzInstagramPayload', {
                detail: JSON.stringify({url: String(url || ''), data: JSON.parse(text)})
            }));
        } catch (e) {}
    }

    const origFetch = window.fetch;
    if (typeof origFetch === 'function') {
        window.fetch = function () {
            const url = (arguments[0] && arguments[0].url) || arguments[0] || '';
            const promise = origFetch.apply(this, arguments);
            promise.then(function (response) {
                try {
                    response.clone().text().then(function (text) {
                        notify(url, text);
                    }).catch(function () {});
                } catch (e) {}
            }).catch(function () {});
            return promise;
        };
    }

    const origOpen = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function (method, url) {
        const xhr = this;
        xhr.addEventListener('load', function () {
            try {
                notify(url, xhr.responseText);
            } catch (e) {}
        });
        return origOpen.apply(this, arguments);
    };

    function fetchIG(url) {
        return origFetch.call(window, url, {
            headers: {'X-IG-App-ID': APP_ID, 'X-Requested-With': 'XMLHttpRequest'},
            credentials: 'include'
        }).then(function (response) {
            return response.text();
        }).then(function (text) {
            notify(url, text);
        }).catch(function () {});
    }

    document.addEventListener('hzInstagramFetchRequest', function (e) {
        try {
            const req = JSON.parse(e.detail);
            if (!req) return;
            if (req.mediaId) {
                fetchIG('/api/v1/media/' + req.mediaId + '/info/').then(function () {
                    if (req.shortcode) return fetchIG('/p/' + req.shortcode + '/?__a=1&__d=dis');
                }).then(function () {
                    if (req.shortcode) return fetchIG('/reel/' + req.shortcode + '/?__a=1&__d=dis');
                });
            } else if (req.shortcode) {
                fetchIG('/p/' + req.shortcode + '/?__a=1&__d=dis').then(function () {
                    return fetchIG('/reel/' + req.shortcode + '/?__a=1&__d=dis');
                });
            }
        } catch (e) {}
    });

    document.addEventListener('hzInstagramProfileRequest', function (e) {
        try {
            const req = e.detail ? JSON.parse(e.detail) : {};
            if (req.username) {
                fetchIG('/api/v1/users/web_profile_info/?username=' + encodeURIComponent(req.username));
            }
        } catch (e) {}
    });

    document.addEventListener('hzInstagramStoryRequest', function (e) {
        try {
            const req = e.detail ? JSON.parse(e.detail) : {};
            fetchIG(req.userId ? '/api/v1/feed/reels_media/?reel_ids=' + encodeURIComponent(req.userId) : '/api/v1/feed/reels_tray/');
        } catch (e) {}
    });

    document.addEventListener('hzInstagramHighlightRequest', function (e) {
        try {
            const req = e.detail ? JSON.parse(e.detail) : {};
            if (req.highlightId) {
                fetchIG('/api/v1/feed/reels_media/?reel_ids=highlight:' + encodeURIComponent(req.highlightId));
            } else if (req.userId) {
                fetchIG('/api/v1/highlights/' + encodeURIComponent(req.userId) + '/highlights_tray/');
            }
        } catch (e) {}
    });
})();
