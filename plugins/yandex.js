var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Yandex',
    version:'1.3',
    prepareImgLinks:function (callback) {
        var res = [];

        // Hook Yandex XMLHttpRequests and fetch to catch data & metadata associated with images and videos.
        // Caught data is stored in sessionStorage for later use by plug-in.
        if ($('script.HZYandexOpen').length === 0) {
            var sendScript = document.createElement('script');
            sendScript.type = 'text/javascript';
            var nonceScript = document.querySelector('script[nonce]');
            if (nonceScript && nonceScript.nonce) {
                sendScript.nonce = nonceScript.nonce;
            }
            sendScript.text = `(function() {
                function saveHooked(text) {
                    try {
                        if (!text || (text.indexOf('"serpList"') === -1 && text.indexOf('"entities"') === -1 && text.indexOf('"rld"') === -1)) return;
                        let stored = sessionStorage.getItem('hookedData') || '[]';
                        stored = JSON.parse(stored);
                        stored = stored.slice(Math.max(0, stored.length - 20));
                        if (stored.indexOf(text) !== -1) return;
                        stored.push(text);
                        sessionStorage.setItem('hookedData', JSON.stringify(stored));

                        let fakeA = document.createElement('a');
                        (document.head || document.documentElement).appendChild(fakeA);
                        (document.head || document.documentElement).removeChild(fakeA);
                    } catch (e) {}
                }

                if (typeof origXHROpen !== 'function') {
                    origXHROpen = window.XMLHttpRequest.prototype.open;
                    window.XMLHttpRequest.prototype.open = function() {
                        this.addEventListener('load', function() {
                            saveHooked(this.responseText);
                        });
                        return origXHROpen.apply(this, arguments);
                    };
                }

                if (typeof origFetch !== 'function' && typeof window.fetch === 'function') {
                    origFetch = window.fetch;
                    window.fetch = function() {
                        return origFetch.apply(this, arguments).then(function(res) {
                            try {
                                res.clone().text().then(saveHooked).catch(function() {});
                            } catch (e) {}
                            return res;
                        });
                    };
                }
            })();`;
            sendScript.classList.add('HZYandexOpen');
            (document.head || document.documentElement).appendChild(sendScript);
        }

        // Search result links with img_url parameter (universal fallback)
        hoverZoom.urlReplace(res,
            'a[href*="img_url="]',
            /.*img_url=([^&]*).*/,
            '$1'
        );

        hoverZoom.urlReplace(res,
            'a img[src*="size="]',
            /[\?&]size=\d+/,
            ''
        );

        hoverZoom.urlReplace(res,
            'img[src*="resize.yandex."]',
            /.*url=([^&]*?).*/,
            '$1',
            'dt'
        );

        $('[onclick*="fitSize"]').each(function() {
            var url = this.getAttribute('onclick');
            if (url = url.match(/fitSize.*?url":"([^"]*)/)) {
                if (url = url[1]) {
                    var link = $(this).find('img');
                    link.data().hoverZoomSrc = [url];
                    res.push(link);
                }
            }
        });

        // Collect entities from modern Yandex React data-state and hooked responses
        var entities = {};

        function collectEntities(obj) {
            if (!obj || typeof obj !== 'object') return;
            if (obj.entities && typeof obj.entities === 'object' && !Array.isArray(obj.entities)) {
                Object.assign(entities, obj.entities);
            }
            for (var key in obj) {
                if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                    if (obj[key].entities && typeof obj[key].entities === 'object' && !Array.isArray(obj[key].entities)) {
                        Object.assign(entities, obj[key].entities);
                    } else if (obj[key].items && obj[key].items.entities) {
                        Object.assign(entities, obj[key].items.entities);
                    }
                }
            }
        }

        // 1. Initial state embedded in page DOM
        $('[data-state*="serpList"], [id^="ImagesApp"][data-state], .ImagesApp[data-state]').each(function() {
            try {
                var raw = this.dataset.state || this.getAttribute('data-state');
                var state = JSON.parse(raw);
                if (state.initialState) collectEntities(state.initialState);
                else collectEntities(state);
            } catch (e) {}
        });

        // 2. Responses stored in sessionStorage from XHR/fetch
        var storedHookedData = sessionStorage.getItem('hookedData') || '[]';
        var parsedHookedData = [];
        try {
            parsedHookedData = JSON.parse(storedHookedData);
            parsedHookedData.forEach(function(itemStr) {
                try {
                    var j = JSON.parse(itemStr);
                    collectEntities(j);
                } catch (e) {}
            });
        } catch (e) {}

        // Index entities by thumbnail ID and img_url for fast lookup
        var byThumbId = {};
        var byImgUrl = {};

        for (var entityId in entities) {
            var ent = entities[entityId];
            if (!ent) continue;

            if (ent.image) {
                var mThumb = ent.image.match(/id=([a-zA-Z0-9_-]+)/);
                if (mThumb) {
                    byThumbId[mThumb[1]] = ent;
                    byThumbId[mThumb[1].split('-')[0]] = ent;
                }
            }

            if (ent.url) {
                var mUrl = ent.url.match(/img_url=([^&]+)/);
                if (mUrl) {
                    try {
                        byImgUrl[decodeURIComponent(mUrl[1])] = ent;
                    } catch (e) {}
                    byImgUrl[mUrl[1]] = ent;
                }
            }
        }

        function extractEntityUrls(ent) {
            var candidates = [];

            if (ent.origUrl) {
                candidates.push({
                    url: ent.origUrl,
                    w: ent.origWidth || 0,
                    h: ent.origHeight || 0,
                    fileSizeInBytes: 0
                });
            }

            if (ent.viewerData) {
                if (ent.viewerData.img_href && ent.viewerData.img_href !== ent.origUrl) {
                    candidates.push({
                        url: ent.viewerData.img_href,
                        w: 0,
                        h: 0,
                        fileSizeInBytes: 0
                    });
                }
                if (Array.isArray(ent.viewerData.dups)) {
                    candidates.push(...ent.viewerData.dups);
                }
                if (Array.isArray(ent.viewerData.preview)) {
                    candidates.push(...ent.viewerData.preview);
                }
            }
            if (Array.isArray(ent.dups)) candidates.push(...ent.dups);
            if (Array.isArray(ent.preview)) candidates.push(...ent.preview);

            // Filter out invalid, avatars, or tiny icons
            candidates = candidates.filter(function(c) {
                if (!c || !c.url) return false;
                if (c.url.indexOf('avatars.mds.yandex.net/get-yapic') !== -1) return false;
                if (c.w && c.h && c.w < 150 && c.h < 150) return false;
                return true;
            });

            // Sort primarily by resolution (pixel area w*h), secondarily by fileSizeInBytes
            candidates.sort(function(a, b) {
                var areaA = (a.w && a.h) ? (a.w * a.h) : (a.fileSizeInBytes || 0);
                var areaB = (b.w && b.h) ? (b.w * b.h) : (b.fileSizeInBytes || 0);
                if (areaA !== areaB) return areaB - areaA;
                return (b.fileSizeInBytes || 0) - (a.fileSizeInBytes || 0);
            });

            var urls = [];
            candidates.forEach(function(c) {
                if (c.url && urls.indexOf(c.url) === -1) {
                    urls.push(c.url);
                }
            });

            if (ent.url) {
                var m = ent.url.match(/img_url=([^&]+)/);
                if (m) {
                    try {
                        var decoded = decodeURIComponent(m[1]);
                        if (urls.indexOf(decoded) === -1) urls.push(decoded);
                    } catch (e) {}
                }
            }

            return urls;
        }

        // store data-bems found in page (legacy support)
        var bems = [];
        $('[data-bem]').each(function() {
            var bem = this.dataset.bem;
            try {
                var o = JSON.parse(bem);
                if (o["serp-item"]) bems.push(o["serp-item"]);
            } catch (e) {}
        });

        function findBestUrl(item, link) {
            var all = [];
            var preview = item["preview"];
            if (preview != undefined) { preview.forEach(function(t) { all.push(t); }); }
            var dups = item["dups"];
            if (dups != undefined) { dups.forEach(function(t) { all.push(t); }); }
            all.sort(function(a, b) { return b.fileSizeInBytes - a.fileSizeInBytes; });
            if (all[0] == undefined) return;
            var url = all[0].url;
            link.data().hoverZoomSrc = [url];
            res.push(link);
        }

        $('img').each(function() {
            var link = $(this);

            // 1. Legacy data-bem parent
            var p = link.parents('div[data-bem]')[0];
            if (p != undefined) {
                var bem = p.dataset.bem;
                if (bem != undefined) {
                    try {
                        var o = JSON.parse(bem);
                        var item = o["serp-item"];
                        if (item != undefined) {
                            findBestUrl(item, link);
                            return;
                        }
                    } catch (e) {}
                }
            }

            // 2. Modern React SerpItem parent / id
            var serpItem = link.closest('[data-pos], [class*="SerpItem"], [class*="serp-item"]');
            var entityId = serpItem.attr('id');
            var ent = entityId ? entities[entityId] : null;

            // 3. Match by thumbnail ID in src
            var src = this.src || '';
            var mThumb = src.match(/\/i\?id=([a-zA-Z0-9_-]+)/);
            if (!ent && mThumb) {
                ent = byThumbId[mThumb[1]] || byThumbId[mThumb[1].split('-')[0]];
            }

            // 4. Match by parent link's img_url
            var parentA = link.closest('a[href*="img_url="]');
            if (!ent && parentA.length) {
                var href = parentA.attr('href') || '';
                var mUrl = href.match(/img_url=([^&]+)/);
                if (mUrl) {
                    try {
                        ent = byImgUrl[decodeURIComponent(mUrl[1])];
                    } catch (e) {}
                    if (!ent) ent = byImgUrl[mUrl[1]];
                }
            }

            if (ent) {
                var urls = extractEntityUrls(ent);
                if (urls.length > 0) {
                    link.data().hoverZoomSrc = urls;
                    res.push(link);
                    if (parentA.length) {
                        parentA.data().hoverZoomSrc = urls;
                        res.push(parentA);
                    }
                    return;
                }
            }

            // 5. Fallback to legacy hooked video data search by tid
            if (mThumb) {
                var tid = mThumb[1].split('-')[0];
                try {
                    var tidData = parsedHookedData.find(function(s) { return s.indexOf(tid) != -1; });
                    if (tidData) {
                        var j = JSON.parse(tidData);
                        var values = hoverZoom.getValuesInJsonObject(j, tid, false, false, true);
                        if (values.length > 0) {
                            var obj = hoverZoom.getJsonObjectFromPath(j, values[0].path.substring(0, values[0].path.lastIndexOf('[')));
                            if (obj && obj.s) {
                                var fullsize = obj.s.sort(function(i) { return i.ih; })[0].iu;
                                link.data().hoverZoomSrc = [fullsize];
                                res.push(link);
                                return;
                            }
                        }
                    }
                } catch (e) {}
            }

            // 6. Direct fallback if inside a[href*="img_url="]
            if (parentA.length) {
                var pHref = parentA.attr('href') || '';
                var pMatch = pHref.match(/img_url=([^&]+)/);
                if (pMatch) {
                    try {
                        var decodedUrl = decodeURIComponent(pMatch[1]);
                        link.data().hoverZoomSrc = [decodedUrl];
                        res.push(link);
                    } catch (e) {}
                }
            }
        });

        // get-yapic
        var regex1 = /(.*)\/.*/;
        var patch1 = '$1/orig';

        hoverZoom.urlReplace(res,
            'img[src*="avatars.mds.yandex.net/get-yapic"]',
            regex1,
            patch1
        );

        $('[style*=url]').each(function() {
            var link = $(this);
            var backgroundImage = this.style.backgroundImage;
            if (backgroundImage.indexOf("url") == -1) return;
            if (backgroundImage.indexOf("avatars.mds.yandex.net/get-yapic") == -1) return;

            var reUrl = /.*url\s*\(\s*(.*)\s*\).*/i;
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            var backgroundImageUrl = backgroundImage.replace(/^['"]/, "").replace(/['"]+$/, "");
            var fullsizeUrl = backgroundImageUrl.replace(regex1, patch1);
            if (fullsizeUrl != backgroundImageUrl) {
                if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = []; }
                if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                    link.data().hoverZoomSrc.unshift(fullsizeUrl);
                    res.push(link);
                }
            }
        });

        // thumbs (background image)
        $('[style*=url]').each(function() {
            var link = $(this);
            var backgroundImage = this.style.backgroundImage;
            if (backgroundImage.indexOf("url") == -1) return;
            if (backgroundImage.indexOf("avatars.mds.yandex.net/get-yapic") != -1) return;

            var reUrl = /.*url\s*\(\s*(.*)\s*\).*/i;
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            var backgroundImageUrl = backgroundImage.replace(/^['"]/, "").replace(/['"]+$/, "");

            var bem = bems.find(function(b) { return b["thumb"] && b["thumb"].url == backgroundImageUrl; });
            if (bem) {
                findBestUrl(bem, link);
                return;
            }

            var mThumb = backgroundImageUrl.match(/\/i\?id=([a-zA-Z0-9_-]+)/);
            if (mThumb) {
                var ent = byThumbId[mThumb[1]] || byThumbId[mThumb[1].split('-')[0]];
                if (ent) {
                    var urls = extractEntityUrls(ent);
                    if (urls.length > 0) {
                        link.data().hoverZoomSrc = urls;
                        res.push(link);
                    }
                }
            }
        });

        callback($(res), this.name);
    }
});
