var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'Instagram',
    version: '0.9',
    favicon: 'instagram.svg',
    prepareImgLinks: function (callback) {
        const pluginName = this.name;
        var res = [];

        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const upper = lower.toUpperCase();
        const numbers = '0123456789';
        const ig_alphabet = upper + lower + numbers + '-_';

        function mediaIdfromShortcode(shortcode) {
            if (!shortcode) return '';
            if (shortcode.length > 11) {
                shortcode = shortcode.substring(0, 11);
            }
            const o = shortcode.replace(/\S/g, m => (ig_alphabet.indexOf(m) >>> 0).toString(2).padStart(6, '0'));
            return BigInt('0b' + o).toString(10);
        }

        function shortcodeFromMediaId(mediaId) {
            if (!mediaId) return '';
            try {
                let idBig = BigInt(String(mediaId).split('_')[0].replace(/^POLARIS_/, ''));
                if (idBig <= 0n) return '';
                let sc = '';
                while (idBig > 0n) {
                    let remainder = Number(idBig % 64n);
                    idBig = idBig / 64n;
                    sc = ig_alphabet[remainder] + sc;
                }
                return sc;
            } catch (e) {
                return '';
            }
        }

        function getBestFromSrcset(srcset) {
            if (!srcset || typeof srcset !== 'string') return null;
            var parts = srcset.split(/,\s+(?=https?:)/);
            var candidates = [];
            for (var i = 0; i < parts.length; i++) {
                var p = parts[i].trim().split(/\s+/);
                if (p[0]) {
                    var width = p[1] ? parseInt(p[1], 10) : 0;
                    if (!width) {
                        var m = p[0].match(/_s(\d+)x/);
                        if (m) width = parseInt(m[1], 10);
                    }
                    candidates.push({ url: p[0], width: width });
                }
            }
            candidates.sort(function (a, b) { return b.width - a.width; });
            return candidates[0] ? candidates[0].url : null;
        }

        function getBestImageUrl(imgObj, displayUrl, displayResources) {
            if (imgObj && Array.isArray(imgObj.candidates) && imgObj.candidates.length) {
                var sorted = imgObj.candidates.slice().sort(function (a, b) {
                    return (b.width * (b.height || b.width)) - (a.width * (a.height || a.width));
                });
                return sorted[0].url;
            }
            if (Array.isArray(displayResources) && displayResources.length) {
                var sortedRes = displayResources.slice().sort(function (a, b) {
                    return (b.config_width * (b.config_height || b.config_width)) - (a.config_width * (a.config_height || a.config_width));
                });
                return sortedRes[0].src;
            }
            return displayUrl || null;
        }

        function getBestVideoUrl(videoVersions, videoUrl, dashManifest) {
            if (Array.isArray(videoVersions) && videoVersions.length) {
                var sorted = videoVersions.slice().sort(function (a, b) {
                    return (b.width * (b.height || b.width)) - (a.width * (a.height || a.width));
                });
                return sorted[0].url;
            }
            if (videoUrl) return videoUrl;
            if (dashManifest && typeof dashManifest === 'string') {
                var m = dashManifest.match(/<BaseURL>([^<]+)<\/BaseURL>/i);
                if (m) return m[1].replace(/&amp;/g, '&');
            }
            return null;
        }

        function parseMediaNode(node) {
            var caption = '';
            if (node.caption) {
                caption = typeof node.caption === 'string' ? node.caption : (node.caption.text || '');
            } else if (node.edge_media_to_caption && node.edge_media_to_caption.edges && node.edge_media_to_caption.edges[0]) {
                caption = node.edge_media_to_caption.edges[0].node.text || '';
            } else if (node.accessibility_caption) {
                caption = node.accessibility_caption;
            }

            var carouselItems = node.carousel_media;
            if (!carouselItems && node.edge_sidecar_to_children && node.edge_sidecar_to_children.edges) {
                carouselItems = node.edge_sidecar_to_children.edges.map(function (e) { return e.node; });
            }

            if (Array.isArray(carouselItems) && carouselItems.length > 0) {
                var gallery = [];
                var captions = [];
                for (var i = 0; i < carouselItems.length; i++) {
                    var item = carouselItems[i];
                    var vUrl = getBestVideoUrl(item.video_versions, item.video_url, item.video_dash_manifest || item.dash_manifest);
                    if (vUrl) {
                        gallery.push([vUrl + '.video']);
                    } else {
                        var iUrl = getBestImageUrl(item.image_versions2, item.display_url, item.display_resources);
                        if (iUrl) gallery.push([iUrl]);
                    }
                    captions.push(caption);
                }
                if (gallery.length > 0) {
                    return {
                        type: 'carousel',
                        gallery: gallery,
                        captions: captions,
                        caption: caption
                    };
                }
            }

            var videoUrl = getBestVideoUrl(node.video_versions, node.video_url, node.video_dash_manifest || node.dash_manifest);
            if (videoUrl && (node.is_video || node.media_type === 2 || node.video_versions)) {
                return {
                    type: 'video',
                    url: videoUrl + '.video',
                    caption: caption
                };
            }

            var imgUrl = getBestImageUrl(node.image_versions2, node.display_url, node.display_resources);
            if (imgUrl) {
                return {
                    type: 'image',
                    url: imgUrl,
                    caption: caption
                };
            }

            return null;
        }

        function processStoriesTray(data, map) {
            if (!data || typeof data !== 'object') return;

            var tray = data.tray || data.reels_media || (data.data && data.data.reels_media);
            if (!tray && data.reels && typeof data.reels === 'object') {
                tray = Object.values(data.reels);
            }
            if (!Array.isArray(tray)) {
                if (data.items && data.user) {
                    tray = [data];
                } else {
                    return;
                }
            }

            for (var i = 0; i < tray.length; i++) {
                var reel = tray[i];
                if (!reel || typeof reel !== 'object') continue;
                var user = reel.user;
                var items = reel.items;
                if (!Array.isArray(items) || items.length === 0) continue;

                var username = user && (user.username || user.pk);
                var userId = user && (user.pk || user.id);
                var profilePic = user && (user.profile_pic_url || user.profile_picture);

                var storyData = null;
                if (items.length > 1) {
                    var gallery = [];
                    var captions = [];
                    for (var j = 0; j < items.length; j++) {
                        var it = items[j];
                        var vUrl = getBestVideoUrl(it.video_versions, it.video_url);
                        if (vUrl && (it.is_video || it.media_type === 2 || it.video_versions)) {
                            gallery.push([vUrl + '.video']);
                        } else {
                            var iUrl = getBestImageUrl(it.image_versions2, it.display_url, it.display_resources);
                            if (iUrl) gallery.push([iUrl]);
                        }
                        var cap = (it.caption && (typeof it.caption === 'string' ? it.caption : it.caption.text)) || (username || '');
                        captions.push(cap);
                    }
                    if (gallery.length > 0) {
                        storyData = {
                            type: 'carousel',
                            gallery: gallery,
                            captions: captions,
                            caption: captions[0]
                        };
                    }
                } else if (items.length === 1) {
                    var single = items[0];
                    var vUrl = getBestVideoUrl(single.video_versions, single.video_url);
                    var cap = (single.caption && (typeof single.caption === 'string' ? single.caption : single.caption.text)) || (username || '');
                    if (vUrl && (single.is_video || single.media_type === 2 || single.video_versions)) {
                        storyData = {
                            type: 'video',
                            url: vUrl + '.video',
                            caption: cap
                        };
                    } else {
                        var iUrl = getBestImageUrl(single.image_versions2, single.display_url, single.display_resources);
                        if (iUrl) {
                            storyData = {
                                type: 'image',
                                url: iUrl,
                                caption: cap
                            };
                        }
                    }
                }

                if (storyData) {
                    if (username) {
                        var uLow = String(username).toLowerCase();
                        map['story_' + uLow] = storyData;
                        map[uLow] = storyData;
                        map['story_' + username] = storyData;
                        map[username] = storyData;
                    }
                    if (userId) {
                        map['story_' + userId] = storyData;
                        map[String(userId)] = storyData;
                    }
                    if (profilePic && typeof profilePic === 'string') {
                        var mPic = profilePic.replace(/.*?([^\/?#]+\.jpg).*/, '$1');
                        if (mPic) map[mPic] = storyData;
                    }
                }
            }
        }

        function processMediaObject(node, map) {
            if (!node || typeof node !== 'object') return;

            var cleanId = null;
            var rawId = node.pk || node.id;
            if (rawId) {
                var sId = String(rawId);
                if (sId.startsWith('POLARIS_')) {
                    sId = sId.substring(8);
                }
                cleanId = sId.split('_')[0];
            }

            var shortcode = node.shortcode || node.code;
            if (!shortcode && cleanId && /^\d+$/.test(cleanId)) {
                shortcode = shortcodeFromMediaId(cleanId);
            }

            var hasMedia = node.carousel_media || node.edge_sidecar_to_children ||
                           node.image_versions2 || node.display_url || node.display_resources ||
                           node.video_versions || node.video_url;

            if (hasMedia && (shortcode || cleanId)) {
                var postData = parseMediaNode(node);
                if (postData) {
                    var isKnownVideo = node.is_video || node.media_type === 2;
                    if (!isKnownVideo || postData.type === 'video') {
                        if (shortcode) {
                            if (!map[shortcode] || postData.type === 'video' || postData.type === 'carousel' || map[shortcode].type === 'image') {
                                map[shortcode] = postData;
                            }
                        }
                        if (cleanId) {
                            if (!map[cleanId] || postData.type === 'video' || postData.type === 'carousel' || map[cleanId].type === 'image') {
                                map[cleanId] = postData;
                            }
                        }
                    }
                }
            }

            if (Array.isArray(node)) {
                for (var i = 0; i < node.length; i++) {
                    processMediaObject(node[i], map);
                }
            } else {
                for (var key in node) {
                    if (Object.prototype.hasOwnProperty.call(node, key) && node[key] && typeof node[key] === 'object') {
                        processMediaObject(node[key], map);
                    }
                }
            }
        }

        function getPostFromMap(map, shortcode) {
            if (!shortcode) return null;
            return map[shortcode] || map[mediaIdfromShortcode(shortcode)] || null;
        }

        function getStoryFromMap(map, username) {
            if (!username) return null;
            var uLow = String(username).toLowerCase();
            return map['story_' + uLow] || map[uLow] || map['story_' + username] || map[username] || null;
        }

        function applyMediaToElement(el, postData) {
            if (!postData) return;
            if (postData.type === 'carousel' && postData.gallery && postData.gallery.length > 0) {
                el.data().hoverZoomGallerySrc = postData.gallery;
                el.data().hoverZoomGalleryCaption = postData.captions;
                var currIdx = el.data().hoverZoomGalleryIndex;
                if (typeof currIdx !== 'number' || currIdx < 0 || currIdx >= postData.gallery.length) {
                    currIdx = 0;
                    el.data().hoverZoomGalleryIndex = 0;
                }
                el.data().hoverZoomSrc = postData.gallery[currIdx];
                el.data().hoverZoomCaption = (postData.captions && postData.captions[currIdx]) ? postData.captions[currIdx] : (postData.caption || '');
            } else if (postData.url) {
                el.data().hoverZoomSrc = [postData.url];
                el.data().hoverZoomCaption = postData.caption || '';
                el.data().hoverZoomGallerySrc = undefined;
                el.data().hoverZoomGalleryIndex = undefined;
                el.data().hoverZoomGalleryCaption = undefined;
            }
        }

        function applyPostMediaIfNew(el, shortcode, postData) {
            if (!shortcode || !postData) return false;
            var currUrl = el.data().hoverZoomSrc && el.data().hoverZoomSrc[0];
            var newUrl = postData.url || (postData.gallery && postData.gallery[0] && postData.gallery[0][0]);
            if (el.data().hoverZoomAppliedShortcode !== shortcode || currUrl !== newUrl) {
                el.data().hoverZoomAppliedShortcode = shortcode;
                applyMediaToElement(el, postData);
                return true;
            }
            return false;
        }

        function matchStoryUsername(text) {
            if (!text || typeof text !== 'string') return null;
            var m = text.match(/^([^'’\n]+)['’]s\s+(?:story|profile picture)/i) ||
                    text.match(/(?:story by|stories by|story of)\s+([a-zA-Z0-9._]+)/i) ||
                    text.match(/^([a-zA-Z0-9._]+)['’]s/i);
            return m ? m[1].trim() : null;
        }

        var mediaMap = {};
        try {
            var stored = sessionStorage.getItem('hzInstagramMedia');
            if (stored) mediaMap = JSON.parse(stored);
        } catch (e) {}

        // Scan any SSR JSON scripts already present in the document
        $('script[type="application/json"]').each(function () {
            try {
                var j = JSON.parse(this.textContent);
                processStoriesTray(j, mediaMap);
                processMediaObject(j, mediaMap);
            } catch (e) {}
        });

        // Inject page-world hook for fetch and XMLHttpRequest to capture API responses
        if ($('script.hoverZoomHookIG').length === 0) {
            var hookScript = document.createElement('script');
            hookScript.type = 'text/javascript';
            hookScript.className = 'hoverZoomHookIG';

            var nonceEl = document.querySelector('script[nonce]');
            var nonce = nonceEl ? (nonceEl.nonce || nonceEl.getAttribute('nonce')) : '';
            if (nonce) {
                hookScript.setAttribute('nonce', nonce);
                hookScript.nonce = nonce;
            }

            hookScript.text = `(function () {
                if (window.__hzInstagramHooked) return;
                window.__hzInstagramHooked = true;

                var hookMediaMap = {};
                try {
                    var st = sessionStorage.getItem('hzInstagramMedia');
                    if (st) hookMediaMap = JSON.parse(st);
                } catch (e) {}

                const ig_alphabet = '${ig_alphabet}';

                ${shortcodeFromMediaId}
                ${getBestImageUrl}
                ${getBestVideoUrl}
                ${parseMediaNode}
                ${processStoriesTray}
                ${processMediaObject}

                function notifyMedia() {
                    try {
                        var keys = Object.keys(hookMediaMap);
                        if (keys.length > 300) {
                            for (var i = 0; i < keys.length - 300; i++) {
                                delete hookMediaMap[keys[i]];
                            }
                        }
                        document.dispatchEvent(new CustomEvent('hzInstagramMediaData', {
                            detail: JSON.stringify(hookMediaMap)
                        }));
                        sessionStorage.setItem('hzInstagramMedia', JSON.stringify(hookMediaMap));
                    } catch (e) {}
                }

                function processIncoming(data) {
                    if (!data || typeof data !== 'object') return;
                    var beforeCount = Object.keys(hookMediaMap).length;
                    processStoriesTray(data, hookMediaMap);
                    processMediaObject(data, hookMediaMap);
                    if (Object.keys(hookMediaMap).length > beforeCount) {
                        notifyMedia();
                    }
                }

                if (typeof window.fetch === 'function') {
                    var origFetch = window.fetch;
                    window.fetch = function () {
                        var promise = origFetch.apply(this, arguments);
                        promise.then(function (response) {
                            try {
                                var clone = response.clone();
                                clone.json().then(function (data) {
                                    processIncoming(data);
                                }).catch(function () {});
                            } catch (e) {}
                        }).catch(function () {});
                        return promise;
                    };
                }

                if (window.XMLHttpRequest && window.XMLHttpRequest.prototype) {
                    var origOpen = window.XMLHttpRequest.prototype.open;
                    window.XMLHttpRequest.prototype.open = function () {
                        this.addEventListener('load', function () {
                            try {
                                var text = this.responseText;
                                if (text && (text.indexOf('image_versions2') !== -1 || text.indexOf('display_url') !== -1 || text.indexOf('carousel_media') !== -1 || text.indexOf('video_versions') !== -1 || text.indexOf('tray') !== -1 || text.indexOf('reels') !== -1)) {
                                    processIncoming(JSON.parse(text));
                                }
                            } catch (e) {}
                        });
                        return origOpen.apply(this, arguments);
                    };
                }

                function fetchIG(url, onFail) {
                    window.fetch(url, {
                        headers: {
                            'X-IG-App-ID': '936619743392459',
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    }).then(function (r) { return r.json(); }).then(function (data) {
                        processIncoming(data);
                    }).catch(function (err) {
                        if (typeof onFail === 'function') onFail(err);
                    });
                }

                document.addEventListener('hzInstagramFetchRequest', function (e) {
                    try {
                        var req = JSON.parse(e.detail);
                        if (!req || (!req.shortcode && !req.mediaId)) return;
                        if (req.shortcode && hookMediaMap[req.shortcode] && hookMediaMap[req.shortcode].type === 'video') {
                            notifyMedia();
                            return;
                        }
                        if (req.mediaId) {
                            fetchIG('/api/v1/media/' + req.mediaId + '/info/', function () {
                                if (req.shortcode) {
                                    fetchIG('/p/' + req.shortcode + '/?__a=1&__d=dis', function () {
                                        fetchIG('/reel/' + req.shortcode + '/?__a=1&__d=dis');
                                    });
                                }
                            });
                        } else if (req.shortcode) {
                            fetchIG('/p/' + req.shortcode + '/?__a=1&__d=dis', function () {
                                fetchIG('/reel/' + req.shortcode + '/?__a=1&__d=dis');
                            });
                        }
                    } catch (err) {}
                });

                document.addEventListener('hzInstagramStoryRequest', function (e) {
                    try {
                        var req = e.detail ? JSON.parse(e.detail) : {};
                        var url = req.userId ? ('/api/v1/feed/reels_media/?reel_ids=' + encodeURIComponent(req.userId)) : '/api/v1/feed/reels_tray/';
                        fetchIG(url);
                    } catch (err) {}
                });

                if (Object.keys(hookMediaMap).length > 0) {
                    notifyMedia();
                }
            })();`;

            (document.head || document.documentElement).appendChild(hookScript);
        }

        // Listen for media extracted by page hook
        document.addEventListener('hzInstagramMediaData', function (e) {
            try {
                var incoming = JSON.parse(e.detail);
                Object.assign(mediaMap, incoming);

                // Update active hovered element if currently hovering
                $('.hoverZoomLink').each(function () {
                    var el = $(this);
                    if (el.data().hoverZoomMouseOver) {
                        var sc = el.data().hoverZoomShortcode;
                        var user = el.data().hoverZoomStoryUser;
                        var postData = getPostFromMap(mediaMap, sc) || getStoryFromMap(mediaMap, user);
                        if (postData) {
                            if (sc) {
                                if (applyPostMediaIfNew(el, sc, postData)) {
                                    hoverZoom.displayPicFromElement(el, true);
                                }
                            } else if (user) {
                                if (el.data().hoverZoomAppliedStoryUser !== user || !el.data().hoverZoomGallerySrc) {
                                    el.data().hoverZoomAppliedStoryUser = user;
                                    applyMediaToElement(el, postData);
                                    hoverZoom.displayPicFromElement(el, true);
                                }
                            }
                        }
                    }
                });
            } catch (err) {}
        });

        function requestPostData(shortcode) {
            if (!shortcode) return;
            var mediaId = mediaIdfromShortcode(shortcode);
            document.dispatchEvent(new CustomEvent('hzInstagramFetchRequest', {
                detail: JSON.stringify({ shortcode: shortcode, mediaId: mediaId })
            }));
        }

        // Helper to bind mouseover / mouseleave on target
        function bindHover(el, shortcode, nativeVideo) {
            if (el.data().hoverZoomBound) return;
            el.data().hoverZoomBound = true;
            if (shortcode) el.data().hoverZoomShortcode = shortcode;

            el.on('mouseenter mouseover', function () {
                var link = $(this);
                var wasOver = link.data().hoverZoomMouseOver;
                link.data().hoverZoomMouseOver = true;

                if (nativeVideo && typeof nativeVideo.pause === 'function') {
                    clearTimeout(nativeVideo._hzResumeTimeout);
                    if (!wasOver) {
                        nativeVideo._hzHoverCount = (nativeVideo._hzHoverCount || 0) + 1;
                    }
                    if (!nativeVideo.paused) {
                        nativeVideo._hzWasPlaying = true;
                        nativeVideo.pause();
                    }
                }

                var sc = link.data().hoverZoomShortcode;
                if (sc) {
                    var postData = getPostFromMap(mediaMap, sc);
                    if (postData && (postData.type === 'video' || (!nativeVideo && postData.url))) {
                        applyPostMediaIfNew(link, sc, postData);
                    } else {
                        requestPostData(sc);
                    }
                }
            }).on('mouseleave', function () {
                var link = $(this);
                if (!link.data().hoverZoomMouseOver) return;
                link.data().hoverZoomMouseOver = false;

                if (nativeVideo && typeof nativeVideo.play === 'function') {
                    nativeVideo._hzHoverCount = Math.max(0, (nativeVideo._hzHoverCount || 1) - 1);
                    if (nativeVideo._hzHoverCount === 0 && nativeVideo._hzWasPlaying) {
                        clearTimeout(nativeVideo._hzResumeTimeout);
                        nativeVideo._hzResumeTimeout = setTimeout(function () {
                            if (nativeVideo._hzHoverCount === 0 && nativeVideo._hzWasPlaying) {
                                nativeVideo._hzWasPlaying = false;
                                nativeVideo.play().catch(function () {});
                            }
                        }, 50);
                    }
                }
            });
        }

        // 1. Feed posts (<article>)
        $('article').each(function () {
            var article = $(this);
            var shortcode = null;
            article.find('a[href*="/p/"], a[href*="/reel/"], a[href*="/reels/"]').each(function () {
                var m = ($(this).attr('href') || '').match(/\/(p|reel|reels)\/([^/?#]+)/);
                if (m && m[2]) {
                    shortcode = m[2];
                    return false;
                }
            });
            if (!shortcode) {
                var timeLink = article.find('time').closest('a');
                if (timeLink.length) {
                    var m = (timeLink.attr('href') || '').match(/\/(p|reel|reels)\/([^/?#]+)/);
                    if (m && m[2]) shortcode = m[2];
                }
            }

            var video = article.find('video').first();
            if (video.length) {
                var vEl = video[0];
                var vTarget = video.closest('div[role="button"], div:has(> video), div:has(> div > video)');
                if (!vTarget.length) vTarget = video.parent();
                var posterImg = article.find('img[src*="cdninstagram.com"], img[src*="fbcdn.net"], img[srcset]').filter(function () {
                    return $(this).closest('header').length === 0;
                }).first();

                bindHover(vTarget, shortcode, vEl);
                bindHover(video, shortcode, vEl);
                if (posterImg.length) bindHover(posterImg, shortcode, vEl);

                var postData = getPostFromMap(mediaMap, shortcode);
                var directVideoUrl = (vEl.currentSrc && /^https?:/.test(vEl.currentSrc) && !/^blob:/.test(vEl.currentSrc)) ? (vEl.currentSrc + '.video') : null;

                if (postData && postData.url && postData.type === 'video') {
                    applyPostMediaIfNew(vTarget, shortcode, postData);
                    applyPostMediaIfNew(video, shortcode, postData);
                    if (posterImg.length) applyPostMediaIfNew(posterImg, shortcode, postData);
                } else if (directVideoUrl) {
                    vTarget.data().hoverZoomSrc = [directVideoUrl];
                    video.data().hoverZoomSrc = [directVideoUrl];
                    if (posterImg.length) posterImg.data().hoverZoomSrc = [directVideoUrl];
                } else {
                    if (shortcode) requestPostData(shortcode);
                    if (posterImg.length) {
                        var bestUrl = getBestFromSrcset(posterImg.attr('srcset')) || posterImg.attr('src');
                        if (bestUrl) {
                            var cap = posterImg.attr('alt') || '';
                            vTarget.data().hoverZoomSrc = [bestUrl + '#hz'];
                            vTarget.data().hoverZoomCaption = cap;
                            video.data().hoverZoomSrc = [bestUrl + '#hz'];
                            video.data().hoverZoomCaption = cap;
                            posterImg.data().hoverZoomSrc = [bestUrl + '#hz'];
                            posterImg.data().hoverZoomCaption = cap;
                        }
                    }
                }

                res.push(vTarget[0]);
                res.push(video[0]);
                if (posterImg.length) res.push(posterImg[0]);
            } else {
                var images = article.find('img[src*="cdninstagram.com"], img[src*="fbcdn.net"], img[srcset]').filter(function () {
                    return $(this).closest('header').length === 0;
                });

                images.each(function () {
                    var img = $(this);
                    var target = img.closest('div[role="button"], div:has(> img)');
                    if (!target.length) target = img;

                    bindHover(target, shortcode);
                    bindHover(img, shortcode);

                    var postData = getPostFromMap(mediaMap, shortcode);
                    if (postData) {
                        applyPostMediaIfNew(target, shortcode, postData);
                        applyPostMediaIfNew(img, shortcode, postData);
                    } else {
                        var slides = [];
                        var captions = [];
                        article.find('ul li img, div[role="presentation"] img').each(function () {
                            var sBest = getBestFromSrcset($(this).attr('srcset')) || this.src;
                            if (sBest && !slides.some(function (s) { return s[0] === (sBest + '#hz'); })) {
                                slides.push([sBest + '#hz']);
                                captions.push($(this).attr('alt') || '');
                            }
                        });

                        function setElementSlides(node) {
                            node.data().hoverZoomGallerySrc = slides;
                            node.data().hoverZoomGalleryCaption = captions;
                            var idx = node.data().hoverZoomGalleryIndex;
                            if (typeof idx !== 'number' || idx < 0 || idx >= slides.length) idx = 0;
                            node.data().hoverZoomGalleryIndex = idx;
                            node.data().hoverZoomSrc = slides[idx];
                            node.data().hoverZoomCaption = captions[idx] || '';
                        }

                        if (slides.length > 1) {
                            setElementSlides(target);
                            setElementSlides(img);
                        } else {
                            var bestUrl = getBestFromSrcset(img.attr('srcset')) || img.attr('src');
                            if (bestUrl) {
                                var cap = img.attr('alt') || '';
                                target.data().hoverZoomSrc = [bestUrl + '#hz'];
                                target.data().hoverZoomCaption = cap;
                                img.data().hoverZoomSrc = [bestUrl + '#hz'];
                                img.data().hoverZoomCaption = cap;
                            }
                        }
                    }

                    res.push(target[0]);
                    res.push(img[0]);
                });
            }
        });

        // 2. Post links (profile grid, explore, individual post pages)
        $('a[href*="/p/"], a[href*="/reel/"], a[href*="/reels/"]').each(function () {
            var link = $(this);
            var m = (link.prop('href') || '').match(/\/(p|reel|reels)\/([^/?#]+)/);
            if (!m) return;
            var shortcode = m[2];

            var video = link.find('video').first();
            var vEl = video.length ? video[0] : null;
            bindHover(link, shortcode, vEl);

            var postData = getPostFromMap(mediaMap, shortcode);
            if (postData) {
                applyPostMediaIfNew(link, shortcode, postData);
            } else {
                var img = link.find('img[src*="cdninstagram"], img[src*="fbcdn"], img[srcset], img[src]').first();
                if (!img.length) img = link.find('img').first();
                if (img.length) {
                    var bestUrl = getBestFromSrcset(img.attr('srcset')) || img.attr('src');
                    if (bestUrl) {
                        link.data().hoverZoomSrc = [bestUrl + '#hz'];
                        link.data().hoverZoomCaption = img.attr('alt') || link.attr('aria-label') || '';
                    }
                } else if (video.length) {
                    var vUrl = video.prop('currentSrc') || video.prop('src') || video.attr('src');
                    if (vUrl && !/^blob:/.test(vUrl)) {
                        link.data().hoverZoomSrc = [vUrl + '.video'];
                    }
                }
            }

            res.push(link[0]);
        });

        // 3. User profile avatars
        $('a[href]').filter(function () {
            return (!/(\/reel\/|\/p\/|\/explore\/|\/stories\/)/.test($(this).prop('href')));
        }).each(function () {
            var link = $(this);
            var img = link.find('img').first();
            if (!img.length) return;

            var bestUrl = getBestFromSrcset(img.attr('srcset')) || img.attr('src');
            if (bestUrl) {
                link.data().hoverZoomSrc = [bestUrl + '#hz'];
                link.data().hoverZoomCaption = img.attr('alt') || '';
                res.push(link[0]);
            }
        });

        // 4. Header reels & highlights (stories)
        function extractStoryUsername(target) {
            if (!target || !target.length) return null;

            // 1. Link href: /stories/<username>/
            var storyLink = target.closest('a[href*="/stories/"]');
            if (!storyLink.length) storyLink = target.find('a[href*="/stories/"]').first();
            if (storyLink.length) {
                var m = (storyLink.attr('href') || '').match(/\/stories\/([^/?#]+)/);
                if (m && m[1] && m[1] !== 'highlights') return m[1];
            }

            // 2. aria-label on target or its parents/children
            var candidates = [
                target.attr('aria-label'),
                target.closest('[aria-label]').attr('aria-label'),
                target.find('[aria-label]').first().attr('aria-label')
            ];
            for (var i = 0; i < candidates.length; i++) {
                var u = matchStoryUsername(candidates[i]);
                if (u) return u;
            }

            // 3. img alt
            var img = target.is('img') ? target : target.find('img').first();
            if (img.length) {
                var u = matchStoryUsername(img.attr('alt'));
                if (u) return u;
            }

            // 4. Look for text in adjacent/child span with valid username format
            var container = target.closest('li, div[role="button"], div[role="menuitem"]');
            if (container.length) {
                var textSpans = container.find('span, div').filter(function () {
                    var t = $(this).text().trim();
                    return t && !t.includes(' ') && !t.includes('\n') && /^[a-zA-Z0-9._]{1,30}$/.test(t);
                });
                if (textSpans.length) {
                    return textSpans.first().text().trim();
                }
            }

            return null;
        }

        function getStoryData(target) {
            var username = extractStoryUsername(target);
            var postData = getStoryFromMap(mediaMap, username);
            if (!postData) {
                var img = target.is('img') ? target : target.find('img').first();
                if (img.length && img.attr('src')) {
                    var fileKey = img.attr('src').replace(/.*?([^\/?#]+\.jpg).*/, '$1');
                    if (fileKey && mediaMap[fileKey]) {
                        postData = mediaMap[fileKey];
                    }
                }
            }
            return { postData: postData, username: username };
        }

        var storyImgs = $('a[href*="/stories/"], div[role="button"] img:not(article img):not(div[role="presentation"] img):not(a[href*="/p/"] img):not(a[href*="/reel/"] img), div[role="menuitem"] img:not(a[href*="/p/"] img):not(a[href*="/reel/"] img), li[role="menuitem"] img');
        storyImgs.each(function () {
            var el = $(this);
            if (el.closest('a[href*="/p/"], a[href*="/reel/"]').length) return;
            var target = el.closest('div[role="button"], div[role="menuitem"], li[role="menuitem"], a[href*="/stories/"]');
            if (!target.length) target = el;
            if (target.closest('a[href*="/p/"], a[href*="/reel/"]').length) return;

            function bindStoryTarget(node) {
                if (node.data().hoverZoomStoryBound) return;
                node.data().hoverZoomStoryBound = true;

                node.on('mouseover', function () {
                    if (document.location.href.match('(following|followers)')) return;
                    var link = $(this);
                    link.data().hoverZoomMouseOver = true;

                    var story = getStoryData(link);
                    if (story.username) {
                        if (link.data().hoverZoomStoryUser !== story.username) {
                            link.data().hoverZoomStoryUser = story.username;
                            link.data().hoverZoomSrc = undefined;
                            link.data().hoverZoomGallerySrc = undefined;
                            link.data().hoverZoomCaption = undefined;
                        }
                    }

                    if (story.postData) {
                        applyMediaToElement(link, story.postData);
                    } else {
                        var img = link.is('img') ? link : link.find('img').first();
                        var bestUrl = getBestFromSrcset(img.attr('srcset')) || img.attr('src');
                        if (bestUrl) {
                            link.data().hoverZoomSrc = [bestUrl + '#hz'];
                            link.data().hoverZoomGallerySrc = undefined;
                        }
                        if (story.username) {
                            document.dispatchEvent(new CustomEvent('hzInstagramStoryRequest', {
                                detail: JSON.stringify({ username: story.username })
                            }));
                        } else {
                            document.dispatchEvent(new CustomEvent('hzInstagramStoryRequest', {
                                detail: JSON.stringify({})
                            }));
                        }
                    }
                }).on('mouseleave', function () {
                    $(this).data().hoverZoomMouseOver = false;
                });
            }

            bindStoryTarget(target);
            bindStoryTarget(el);

            var story = getStoryData(target);
            if (story.username) {
                target.data().hoverZoomStoryUser = story.username;
                el.data().hoverZoomStoryUser = story.username;
            }
            if (story.postData) {
                applyMediaToElement(target, story.postData);
                applyMediaToElement(el, story.postData);
            } else {
                var bestUrl = getBestFromSrcset(el.attr('srcset')) || el.attr('src');
                if (bestUrl) {
                    target.data().hoverZoomSrc = [bestUrl + '#hz'];
                    el.data().hoverZoomSrc = [bestUrl + '#hz'];
                }
            }

            res.push(target[0]);
            res.push(el[0]);
        });

        callback($(res), pluginName);
    }
});
