var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'Instagram',
    version: '0.10',
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

        function ensureHzUrl(url) {
            if (!url || typeof url !== 'string') return url;
            if (url.endsWith('#hz') || url.endsWith('.video')) return url;
            return url + '#hz';
        }

        const reservedUsernames = ['p', 'reel', 'reels', 'tv', 'stories', 'explore', 'direct', 'accounts',
                                   'about', 'legal', 'api', 'oauth', 'graphql', 'web', 'challenge',
                                   'emojis', 'locations', 'nametag', 'topics', 'your_activity'];

        function usernameFromHref(href) {
            if (!href) return null;
            var m = String(href).match(/^https?:\/\/(?:www\.)?instagram\.com\/([^/?#]+)/i);
            if (!m) return null;
            var username = decodeURIComponent(m[1]);
            if (!/^[a-zA-Z0-9._]{1,30}$/.test(username)) return null;
            if (reservedUsernames.indexOf(username.toLowerCase()) !== -1) return null;
            return username;
        }

        // Avatars, posts and stories are queried through the extension background page: those
        // requests carry the X-IG-App-ID header, use the browser session and are not restricted
        // by the page's CSP/CORS rules (the approach the 0.7 plugin used for profile pages).
        function igRequestHeaders() {
            var headers = [{header: 'X-IG-App-ID', value: '936619743392459'}];
            // Instagram's web API requires the CSRF token that its own scripts send
            var csrf = typeof hoverZoom.getCookie === 'function' ? hoverZoom.getCookie('csrftoken') : null;
            if (csrf) {
                headers.push({header: 'X-CSRFToken', value: csrf});
            }
            return headers;
        }

        var usersCache = {};
        try {
            var storedUsers = sessionStorage.getItem('hzInstagramUsers');
            if (storedUsers) usersCache = JSON.parse(storedUsers);
        } catch (e) {}

        var userRequests = {};
        var userFailures = {};
        var postRequests = {};
        var storyRequests = {};

        function saveUsersCache() {
            try {
                sessionStorage.setItem('hzInstagramUsers', JSON.stringify(usersCache));
            } catch (e) {
                // sessionStorage is full: keep only the most recently requested users
                var keys = Object.keys(usersCache);
                var keep = {};
                for (var i = Math.max(0, keys.length - 50); i < keys.length; i++) {
                    keep[keys[i]] = usersCache[keys[i]];
                }
                usersCache = keep;
                try { sessionStorage.setItem('hzInstagramUsers', JSON.stringify(usersCache)); } catch (e2) {}
            }
        }

        var igRequestTimeout = 3000;

        // a request that never answers (asleep service worker, blocked request) must not stop the
        // caller from trying the next route
        function igSendMessage(url, onResponse) {
            var done = false;
            var timer = setTimeout(function () {
                if (done) return;
                done = true;
                igLog('instagram: no answer for ' + url);
                onResponse(null);
            }, igRequestTimeout);

            var finish = function (response) {
                if (done) return;
                done = true;
                clearTimeout(timer);
                onResponse(typeof response === 'string' ? response : null);
            };

            try {
                // credentials: the instagram API answers with the user's session only
                chrome.runtime.sendMessage({action: 'ajaxGet', url: url, headers: igRequestHeaders(), credentials: 'include'}, finish);
            } catch (e) {
                igLog('instagram: request failed for ' + url + ' (' + e + ')');
                finish(null);
            }
        }

        function igGet(url, onData) {
            igSendMessage(url, function (text) {
                var data = null;
                if (text) {
                    try {
                        data = JSON.parse(text);
                    } catch (e) {}
                }
                if (!data) igLog('instagram: no JSON from ' + url);
                onData(data);
            });
        }

        function igGetText(url, onText) {
            igSendMessage(url, onText);
        }

        function requestUserProfile(username, onProfile) {
            if (!username) return;
            if (usersCache[username]) {
                if (onProfile) onProfile(usersCache[username]);
                return;
            }
            if (userRequests[username]) {
                if (onProfile) userRequests[username].push(onProfile);
                return;
            }
            // the page bridge fetches with the page's own session: a fresh chance even while the extension
            // request is rate limited (instagram answers 429 to the extension origin)
            document.dispatchEvent(new CustomEvent('hzInstagramProfileRequest', {
                detail: JSON.stringify({username: username})
            }));
            if (userFailures[username] && Date.now() - userFailures[username] < 60000) return;

            userRequests[username] = onProfile ? [onProfile] : [];
            igGet('https://www.instagram.com/api/v1/users/web_profile_info/?username=' + encodeURIComponent(username), function (data) {
                var callbacks = userRequests[username] || [];
                delete userRequests[username];
                var apiUser = data && data.data && data.data.user;
                if (apiUser) {
                    usersCache[username] = {
                        id: apiUser.id || apiUser.pk,
                        full_name: apiUser.full_name || '',
                        profile_pic_url: apiUser.profile_pic_url_hd || apiUser.profile_pic_url || ''
                    };
                    saveUsersCache();
                } else {
                    userFailures[username] = Date.now();
                }
                for (var i = 0; i < callbacks.length; i++) {
                    callbacks[i](usersCache[username] || null);
                }
            });
        }

        function requestPostData(shortcode) {
            if (!shortcode) return;
            var state = postRequests[shortcode];
            if (state === true || (typeof state === 'number' && Date.now() - state < 60000)) return;
            var mediaId = mediaIdfromShortcode(shortcode);
            if (!mediaId) return;
            postRequests[shortcode] = true;

            // the page bridge fetches with the page's own session, the extension request runs in parallel
            document.dispatchEvent(new CustomEvent('hzInstagramFetchRequest', {
                detail: JSON.stringify({shortcode: shortcode, mediaId: mediaId})
            }));
            igGet('https://www.instagram.com/api/v1/media/' + mediaId + '/info/', function (data) {
                var fetched = {};
                if (data) processMediaObject(data, fetched);
                if (fetched[shortcode] || fetched[mediaId]) {
                    delete postRequests[shortcode];
                    mergeMediaData(fetched);
                } else {
                    postRequests[shortcode] = Date.now();
                }
            });
        }

        // debug output, only shown when the extension's debug option is enabled
        function igLog(message) {
            if (typeof hoverZoom.cLog === 'function') {
                hoverZoom.cLog(message);
            }
        }

        // numeric user id known from the page payloads / the profile API
        function storyUserId(username) {
            if (!username) return null;
            if (usersCache[username] && usersCache[username].id) return usersCache[username].id;
            return mediaMap['uid_' + String(username).toLowerCase()] || null;
        }

        function applyStoryMap(fetched) {
            if (!fetched || Object.keys(fetched).length === 0) return false;
            mergeMediaData(fetched);
            return true;
        }

        // reels_media responses key user stories by user name and highlights by 'highlight:<id>'
        function applyStoryResponse(data, wantedKey) {
            if (!data || !Array.isArray(data.reels_media) || data.reels_media.length === 0) return false;
            var fetched = {};
            processStoriesTray(data, fetched);
            if (wantedKey && !fetched[wantedKey]) {
                for (var k in fetched) {
                    if (/^(story_|highlight:)/.test(k)) {
                        fetched[wantedKey] = fetched[k];
                        break;
                    }
                }
            }
            return applyStoryMap(fetched);
        }

        // Instagram embeds the payload of every page it serves as JSON script blocks; a page fetched
        // by the extension is mined the same way (last resort when the API does not answer)
        function applyStoryFromHtml(html, wantedKey) {
            if (!html || typeof html !== 'string') return false;
            var fetched = {};
            var re = /<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/gi;
            var m;
            while ((m = re.exec(html))) {
                try {
                    var j = JSON.parse(m[1]);
                    processStoriesTray(j, fetched);
                    processMediaObject(j, fetched);
                    processHighlightsTray(j, fetched);
                } catch (e) {}
            }
            if (wantedKey && !fetched[wantedKey]) {
                for (var k in fetched) {
                    if (/^(story_|highlight:)/.test(k)) {
                        fetched[wantedKey] = fetched[k];
                        break;
                    }
                }
            }
            return applyStoryMap(fetched);
        }

        function requestStoryData(username, userId, onUnavailable) {
            if (!username) return;
            var key = 'user:' + String(username).toLowerCase();
            if (storyRequests[key]) {
                // several elements can share the same story: every one of them has to learn about it
                if (typeof onUnavailable === 'function') storyRequests[key].push(onUnavailable);
                return;
            }
            storyRequests[key] = typeof onUnavailable === 'function' ? [onUnavailable] : [];

            var finish = function (ok) {
                var waiters = storyRequests[key] || [];
                delete storyRequests[key];
                if (!ok) {
                    for (var i = 0; i < waiters.length; i++) {
                        waiters[i]();
                    }
                }
            };

            // the page world fetches with the page's own session as first party; its results arrive
            // with hzInstagramPayload
            var askPage = function (id) {
                igLog('instagram: asking the page for the story of ' + username + (id ? ' (id ' + id + ')' : ''));
                document.dispatchEvent(new CustomEvent('hzInstagramStoryRequest', {
                    detail: JSON.stringify({username: username, userId: id || userId})
                }));
            };

            var tryPage = function (id) {
                askPage(id);
                igGetText('https://www.instagram.com/stories/' + encodeURIComponent(username) + '/', function (html) {
                    finish(applyStoryFromHtml(html, 'story_' + String(username).toLowerCase()));
                });
            };

            var tryApi = function (id) {
                igLog('instagram: story of ' + username + ' via reels_media (id ' + id + ')');
                // both routes are started at once: whichever answers first wins
                askPage(id);
                igGet('https://www.instagram.com/api/v1/feed/reels_media/?reel_ids=' + encodeURIComponent(id), function (data) {
                    if (applyStoryResponse(data)) {
                        finish(true);
                        return;
                    }
                    igLog('instagram: story of ' + username + ' via reels_media failed, trying the story page');
                    tryPage(id);
                });
            };

            var id = userId || storyUserId(username);
            if (id) {
                tryApi(id);
                return;
            }
            requestUserProfile(username, function (user) {
                if (user && user.id) {
                    tryApi(user.id);
                } else {
                    tryPage(null);
                }
            });
        }

        var highlightsTrayRequests = {};

        // the highlights of a profile are listed by the tray endpoint; covers found there are
        // matched to the images of the page
        function requestHighlightsTray(username, onDone) {
            if (!username) return;
            var key = String(username).toLowerCase();
            if (highlightsTrayRequests[key]) return;
            highlightsTrayRequests[key] = true;

            var fetchTray = function (uid) {
                igLog('instagram: highlights tray of ' + username + ' (' + uid + ')');
                // the page world fetches with the page's own session as first party
                document.dispatchEvent(new CustomEvent('hzInstagramHighlightRequest', {
                    detail: JSON.stringify({userId: uid})
                }));
                igGet('https://www.instagram.com/api/v1/highlights/' + encodeURIComponent(uid) + '/highlights_tray/', function (data) {
                    var fetched = {};
                    if (data) processHighlightsTray(data, fetched);
                    var found = Object.keys(fetched).length > 0;
                    igLog('instagram: highlights tray of ' + username + (found ? ' resolved' : ' empty'));
                    if (found) {
                        mergeMediaData(fetched);
                        if (typeof onDone === 'function') onDone();
                    }
                });
            };

            var id = storyUserId(username);
            if (id) {
                fetchTray(id);
                return;
            }
            requestUserProfile(username, function (user) {
                if (user && user.id) fetchTray(user.id);
            });
        }

        function requestHighlightData(highlightId, onUnavailable) {
            if (!highlightId) return;
            var key = 'highlight:' + highlightId;
            if (storyRequests[key]) {
                if (typeof onUnavailable === 'function') storyRequests[key].push(onUnavailable);
                return;
            }
            storyRequests[key] = typeof onUnavailable === 'function' ? [onUnavailable] : [];

            var finish = function (ok) {
                var waiters = storyRequests[key] || [];
                delete storyRequests[key];
                if (!ok) {
                    for (var i = 0; i < waiters.length; i++) {
                        waiters[i]();
                    }
                }
            };

            document.dispatchEvent(new CustomEvent('hzInstagramHighlightRequest', {
                detail: JSON.stringify({highlightId: highlightId})
            }));
            igGet('https://www.instagram.com/api/v1/feed/reels_media/?reel_ids=highlight:' + encodeURIComponent(highlightId), function (data) {
                if (applyStoryResponse(data, key)) {
                    finish(true);
                    return;
                }
                igGetText('https://www.instagram.com/stories/highlights/' + encodeURIComponent(highlightId) + '/', function (html) {
                    finish(applyStoryFromHtml(html, key));
                });
            });
        }

        // applies freshly fetched media to the elements it was requested for
        // (displayPicFromElement only displays it if the cursor is still over the element)
        function refreshMediaElements() {
            $('.hoverZoomLink').each(function () {
                var el = $(this);
                var sc = el.data().hoverZoomShortcode;
                var storyKey = el.data().hoverZoomStoryKey;
                var postData = getPostFromMap(mediaMap, sc) || (storyKey ? getStoryFromMap(mediaMap, storyKey) : null);
                if (!postData) return;

                var applied = false;
                if (sc) {
                    applied = applyPostMediaIfNew(el, sc, postData);
                } else if (storyKey) {
                    var currUrl = el.data().hoverZoomSrc && el.data().hoverZoomSrc[0];
                    var newUrl = postData.url ? ensureHzUrl(postData.url) : (postData.gallery && postData.gallery[0] && ensureHzUrl(postData.gallery[0][0]));
                    if (el.data().hoverZoomAppliedStoryKey !== storyKey || currUrl !== newUrl) {
                        el.data().hoverZoomAppliedStoryKey = storyKey;
                        applyMediaToElement(el, postData);
                        applied = true;
                    }
                }

                if (applied) {
                    hoverZoom.displayPicFromElement(el);
                }
            });
        }

        // payloads captured or fetched by the page bridge
        function processPayload(payload) {
            if (!payload || !payload.data) return;
            processUserPayload(payload.data);
            var fetched = {};
            processStoriesTray(payload.data, fetched);
            processMediaObject(payload.data, fetched);
            processHighlightsTray(payload.data, fetched);
            var keys = Object.keys(fetched);
            if (keys.length === 0) return;
            igLog('instagram: page bridge delivered ' + keys.length + ' entries (' + String(payload.url).slice(0, 90) + ')');
            mergeMediaData(fetched);
        }

        function mergeMediaData(incoming) {
            if (!incoming) return;
            Object.assign(mediaMap, incoming);
            // highlight covers can only be told apart once their reel ids are known
            var incomingKeys = Object.keys(incoming);
            for (var k = 0; k < incomingKeys.length; k++) {
                if (/^(hlid_|story_|uid_)/.test(incomingKeys[k])) {
                    prepareStoryTargets();
                    break;
                }
            }
            try {
                var storedKeys = Object.keys(mediaMap);
                if (storedKeys.length > 300) {
                    for (var i = 0; i < storedKeys.length - 300; i++) {
                        delete mediaMap[storedKeys[i]];
                    }
                }
                sessionStorage.setItem('hzInstagramMedia', JSON.stringify(mediaMap));
            } catch (e) {}
            refreshMediaElements();
        }

        // a profile API payload delivered by the page bridge
        function processUserPayload(data) {
            var apiUser = data && data.data && data.data.user;
            if (!apiUser || !apiUser.username) return;
            igLog('instagram: profile of ' + apiUser.username + ' via the page bridge');
            usersCache[apiUser.username] = {
                id: apiUser.id || apiUser.pk,
                full_name: apiUser.full_name || '',
                profile_pic_url: apiUser.profile_pic_url_hd || apiUser.profile_pic_url || ''
            };
            saveUsersCache();
            var callbacks = userRequests[apiUser.username];
            if (callbacks) {
                delete userRequests[apiUser.username];
                for (var i = 0; i < callbacks.length; i++) {
                    callbacks[i](usersCache[apiUser.username]);
                }
            }
            $('.hoverZoomLink').each(function () {
                var el = $(this);
                if (el.data().hoverZoomProfileUser === apiUser.username) {
                    applyProfilePicture(el, usersCache[apiUser.username]);
                }
            });
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
            } else if (node.user && node.user.full_name) {
                caption = node.user.full_name;
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
                        if (iUrl) gallery.push([ensureHzUrl(iUrl)]);
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
                    url: ensureHzUrl(imgUrl),
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
                // highlights (reel_ids=highlight:<id>) are keyed by their own id so that several
                // highlight reels of the same user do not overwrite each other
                var reelId = reel.id ? String(reel.id) : '';
                var isHighlight = /^highlight:/.test(reelId) || reel.reel_type === 'highlight';

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
                            if (iUrl) gallery.push([ensureHzUrl(iUrl)]);
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
                                url: ensureHzUrl(iUrl),
                                caption: cap
                            };
                        }
                    }
                }

                if (storyData) {
                    if (isHighlight && reelId) {
                        map[reelId] = storyData;
                    } else if (username || userId) {
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
                    }
                    if (profilePic && typeof profilePic === 'string') {
                        var mPic = profilePic.replace(/.*?([^\/?#]+\.jpg).*/, '$1');
                        if (mPic) map[mPic] = storyData;
                    }
                }
            }
        }

        // the file name identifies a media across the different size variants of its CDN url
        function coverFileKey(url) {
            if (!url || typeof url !== 'string') return null;
            var m = url.match(/([^\/?#]+\.jpg)/);
            return m ? m[1] : null;
        }

        // A highlight tray lists every highlight group with its cover: map the cover file names to
        // the highlight ids. That is what allows a highlight cover to be zoomed no matter how the
        // profile page links (or does not link) it.
        function processHighlightsTray(data, map) {
            if (!data || typeof data !== 'object') return;
            var tray = data.tray || (data.data && data.data.tray);
            if (!Array.isArray(tray)) return;
            for (var i = 0; i < tray.length; i++) {
                var item = tray[i];
                if (!item || typeof item !== 'object' || !item.id) continue;
                var cover = item.cover_media || item.cover || {};
                var versions = cover.image_versions2 || item.image_versions2;
                var coverUrl = (versions && versions.candidates && versions.candidates.length && versions.candidates[0].url) ||
                               cover.thumbnail_src || item.thumbnail_src || '';
                var fileKey = coverFileKey(coverUrl);
                if (fileKey) map['hlid_' + fileKey] = String(item.id);
            }
        }

        // keeps the most complete variant of a post: album > video > image
        function storePost(map, key, postData) {
            if (!key || !postData) return;
            var existing = map[key];
            if (existing &&
                !(postData.type === 'carousel' && existing.type !== 'carousel') &&
                !(postData.type === 'video' && existing.type === 'image') &&
                !(postData.type === 'image' && existing.type === 'image')) {
                return;
            }
            map[key] = postData;
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

            // remember user name -> numeric id pairs so that stories can be queried without
            // asking the profile API for the id first
            if (typeof node.username === 'string' && /^[a-zA-Z0-9._]{1,30}$/.test(node.username)) {
                var rawUserId = node.pk || node.id || node.user_id || node.owner_id;
                if (rawUserId !== undefined && rawUserId !== null && /^\d+$/.test(String(rawUserId))) {
                    map['uid_' + node.username.toLowerCase()] = String(rawUserId);
                }
            }

            var hasMedia = node.carousel_media || node.edge_sidecar_to_children ||
                           node.image_versions2 || node.display_url || node.display_resources ||
                           node.video_versions || node.video_url;

            if (hasMedia && (shortcode || cleanId)) {
                var postData = parseMediaNode(node);
                if (postData) {
                    storePost(map, shortcode, postData);
                    storePost(map, cleanId, postData);
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

        // Media is fetched asynchronously. hoverZoom loads a source only once, so a placeholder
        // (thumbnail or video poster) displayed before the request resolves would never be replaced
        // by the fetched media. Therefore the placeholder is hidden while a request is in flight
        // (the 0.7 plugin cleared the source for the same reason) and is restored if nothing is
        // fetched. displayPicFromElement() only opens the viewer if the cursor is still over the link.
        var placeholderRestoreDelay = 2000;

        // hides the media hoverZoom is currently showing; it swallows mouse moves as long as it has
        // a source, so it would neither drop the source hiding behind this link nor display the
        // fetched media afterwards
        function closeDisplayedMedia() {
            if (!hoverZoom.currentLink) return;
            hoverZoom.currentLink = $();
            $(document).mousemove();
        }

        function awaitFetchedMedia(el) {
            if (el.data().hoverZoomFetchPending) return;
            el.data().hoverZoomFetchPending = true;
            el.data().hoverZoomPlaceholderSrc = el.data().hoverZoomSrc;
            el.data().hoverZoomPlaceholderCaption = el.data().hoverZoomCaption;
            el.data().hoverZoomSrc = undefined;
            el.data().hoverZoomGallerySrc = undefined;
            closeDisplayedMedia();

            clearTimeout(el.data().hoverZoomPlaceholderTimer);
            el.data().hoverZoomPlaceholderTimer = setTimeout(function () {
                restorePlaceholder(el);
            }, placeholderRestoreDelay);
        }

        // shows the placeholder again when the fetched media did not materialize
        function restorePlaceholder(el) {
            if (!el.data().hoverZoomFetchPending) return;
            var src = el.data().hoverZoomPlaceholderSrc;
            var caption = el.data().hoverZoomPlaceholderCaption;
            clearFetchedMedia(el);
            if (!src || !src.length) return;
            el.data().hoverZoomSrc = src;
            if (caption) el.data().hoverZoomCaption = caption;
            hoverZoom.displayPicFromElement(el);
        }

        function clearFetchedMedia(el) {
            clearTimeout(el.data().hoverZoomPlaceholderTimer);
            el.data().hoverZoomFetchPending = false;
        }

        // places the placeholder media (thumbnail / poster) unless fetched media is on its way
        function setPlaceholderMedia(el, src, caption) {
            if (el.data().hoverZoomFetchPending) return;
            el.data().hoverZoomSrc = src;
            if (caption !== undefined) el.data().hoverZoomCaption = caption;
            el.data().hoverZoomGallerySrc = undefined;
            el.data().hoverZoomGalleryIndex = undefined;
            el.data().hoverZoomGalleryCaption = undefined;
        }

        function setPlaceholderGallery(el, gallery, captions) {
            if (el.data().hoverZoomFetchPending) return;
            el.data().hoverZoomGallerySrc = gallery;
            el.data().hoverZoomGalleryCaption = captions;
            var idx = el.data().hoverZoomGalleryIndex;
            if (typeof idx !== 'number' || idx < 0 || idx >= gallery.length) idx = 0;
            el.data().hoverZoomGalleryIndex = idx;
            el.data().hoverZoomSrc = gallery[idx];
            el.data().hoverZoomCaption = captions[idx] || '';
        }

        function applyMediaToElement(el, postData) {
            if (!postData) return;
            clearFetchedMedia(el);
            if (postData.type === 'carousel' && postData.gallery && postData.gallery.length > 0) {
                var ensuredGallery = postData.gallery.map(function (slide) {
                    return slide.map(ensureHzUrl);
                });
                el.data().hoverZoomGallerySrc = ensuredGallery;
                el.data().hoverZoomGalleryCaption = postData.captions;
                var currIdx = el.data().hoverZoomGalleryIndex;
                if (typeof currIdx !== 'number' || currIdx < 0 || currIdx >= ensuredGallery.length) {
                    currIdx = 0;
                    el.data().hoverZoomGalleryIndex = 0;
                }
                el.data().hoverZoomSrc = ensuredGallery[currIdx];
                el.data().hoverZoomCaption = (postData.captions && postData.captions[currIdx]) ? postData.captions[currIdx] : (postData.caption || '');
            } else if (postData.url) {
                el.data().hoverZoomSrc = [ensureHzUrl(postData.url)];
                el.data().hoverZoomCaption = postData.caption || '';
                el.data().hoverZoomGallerySrc = undefined;
                el.data().hoverZoomGalleryIndex = undefined;
                el.data().hoverZoomGalleryCaption = undefined;
            }
        }

        function applyPostMediaIfNew(el, shortcode, postData) {
            if (!shortcode || !postData) return false;
            var currUrl = el.data().hoverZoomSrc && el.data().hoverZoomSrc[0];
            var newUrl = postData.url ? ensureHzUrl(postData.url) : (postData.gallery && postData.gallery[0] && ensureHzUrl(postData.gallery[0][0]));
            if (el.data().hoverZoomAppliedShortcode !== shortcode || currUrl !== newUrl) {
                el.data().hoverZoomAppliedShortcode = shortcode;
                applyMediaToElement(el, postData);
                return true;
            }
            return false;
        }

        function matchStoryUsername(text) {
            if (!text || typeof text !== 'string') return null;
            var m = text.match(/^([^'’\n]+)['’]s\s+(?:story|stories|profile picture|profile photo)/i) ||
                    text.match(/(?:story by|stories by|story of)\s+([a-zA-Z0-9._]+)/i) ||
                    text.match(/^(?:story|stories)\s+by\s+([a-zA-Z0-9._]+)/i);
            return m ? m[1].trim() : null;
        }

        function isAvatarImg(img) {
            if (!img || !img.length) return false;
            var alt = img.attr('alt') || '';
            if (/profile picture|profile photo/i.test(alt) || /['’]s\s+(?:story|stories|profile picture)/i.test(alt)) return true;
            var src = img.attr('src') || '';
            if (/\/t51\.\d+-19\/|profile_pic/i.test(src)) return true;
            if (img.closest('header, [role="button"]:has(canvas), [role="link"]:has(canvas)').length > 0) return true;
            return false;
        }

        var mediaMap = {};
        try {
            var stored = sessionStorage.getItem('hzInstagramMedia');
            if (stored) mediaMap = JSON.parse(stored);
        } catch (e) {}

        // user owning the current profile page (if any)
        var pageUsername = usernameFromHref(document.location.href);

        // Scan any SSR JSON scripts already present in the document
        $('script[type="application/json"]').each(function () {
            try {
                var j = JSON.parse(this.textContent);
                processStoriesTray(j, mediaMap);
                processMediaObject(j, mediaMap);
                processHighlightsTray(j, mediaMap);
            } catch (e) {}
        });

        // Inject the page-world bridge (a web accessible resource: inline scripts are blocked by
        // the instagram.com CSP). It captures the API payloads of the page and replays the
        // requests dispatched by this plugin, both with the page's own session.
        if (!window.__hzInstagramBridgeInjected && typeof chrome.runtime.getURL === 'function') {
            window.__hzInstagramBridgeInjected = true;
            var hookScript = document.createElement('script');
            hookScript.className = 'hoverZoomHookIG';
            hookScript.src = chrome.runtime.getURL('js/hoverZoomInstagramHook.js');
            hookScript.onerror = function () {
                igLog('instagram: page bridge could not be loaded');
            };
            (document.head || document.documentElement).appendChild(hookScript);
        }


        // Listen for payloads delivered by the page bridge and scroll (bind only once)
        if (!window.__hzInstagramEventsBound) {
            window.__hzInstagramEventsBound = true;

            document.addEventListener('hzInstagramPayload', function (e) {
                try {
                    processPayload(JSON.parse(e.detail));
                } catch (err) {}
            });

            $(window).on('scroll', function () {
                $('.hoverZoomLink').each(function () {
                    if (!$(this).is(':hover')) {
                        $(this).data().hoverZoomMouseOver = false;
                    }
                });
            });
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
                    }
                    nativeVideo.pause();
                    // the site's player resumes the video on its own (e.g. through its own mouse
                    // handling), so the pause is enforced while the zoomed media is displayed
                    clearInterval(nativeVideo._hzPauseInterval);
                    nativeVideo._hzPauseInterval = setInterval(function () {
                        if (nativeVideo._hzHoverCount > 0 && !nativeVideo.paused) {
                            nativeVideo.pause();
                        }
                    }, 250);
                }

                var sc = link.data().hoverZoomShortcode;
                if (sc) {
                    var postData = getPostFromMap(mediaMap, sc);
                    if (postData && (postData.type === 'video' || (!nativeVideo && (postData.url || postData.gallery)))) {
                        applyPostMediaIfNew(link, sc, postData);
                    } else {
                        // hide the thumbnail / poster: the fetched media has to replace it
                        awaitFetchedMedia(link);
                        requestPostData(sc);
                    }
                }
            }).on('mouseleave', function () {
                var link = $(this);
                if (!link.data().hoverZoomMouseOver) return;
                link.data().hoverZoomMouseOver = false;

                if (nativeVideo && typeof nativeVideo.play === 'function') {
                    nativeVideo._hzHoverCount = Math.max(0, (nativeVideo._hzHoverCount || 1) - 1);
                    if (nativeVideo._hzHoverCount === 0) {
                        clearInterval(nativeVideo._hzPauseInterval);
                    }
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

            // Feed post author avatar
            var avatarImg = article.find('img').filter(function () {
                return isAvatarImg($(this));
            }).first();
            if (avatarImg.length) {
                var avTarget = avatarImg.closest('div[role="button"], span[role="link"], a');
                if (!avTarget.length) avTarget = avatarImg;
                var avBest = getBestFromSrcset(avatarImg.attr('srcset')) || avatarImg.attr('src');
                if (avBest) {
                    var avCaption = avatarImg.attr('alt') || '';
                    setPlaceholderMedia(avTarget, [ensureHzUrl(avBest)], avCaption);
                    setPlaceholderMedia(avatarImg, [ensureHzUrl(avBest)], avCaption);
                    if (avTarget.data().hoverZoomSrc && res.indexOf(avTarget[0]) === -1) res.push(avTarget[0]);
                    if (avatarImg.data().hoverZoomSrc && res.indexOf(avatarImg[0]) === -1) res.push(avatarImg[0]);
                }
            }

            var video = article.find('video').first();
            if (video.length) {
                var vEl = video[0];
                var vTarget = video.closest('div._aagu');
                if (!vTarget.length) vTarget = video.closest('div[role="button"], div:has(> div > video), div:has(> video)');
                if (!vTarget.length) vTarget = video.parent();
                var posterImg = article.find('img[src*="cdninstagram.com"], img[src*="fbcdn.net"], img[srcset]').filter(function () {
                    return !isAvatarImg($(this)) && $(this).closest('header').length === 0;
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
                            setPlaceholderMedia(vTarget, [ensureHzUrl(bestUrl)], cap);
                            setPlaceholderMedia(video, [ensureHzUrl(bestUrl)], cap);
                            setPlaceholderMedia(posterImg, [ensureHzUrl(bestUrl)], cap);
                        }
                    }
                }

                if (vTarget.data().hoverZoomSrc && res.indexOf(vTarget[0]) === -1) res.push(vTarget[0]);
                if (video.data().hoverZoomSrc && res.indexOf(video[0]) === -1) res.push(video[0]);
                if (posterImg.length && posterImg.data().hoverZoomSrc && res.indexOf(posterImg[0]) === -1) res.push(posterImg[0]);
            } else {
                var images = article.find('img[src*="cdninstagram.com"], img[src*="fbcdn.net"], img[srcset]').filter(function () {
                    return !isAvatarImg($(this)) && $(this).closest('header').length === 0;
                });

                images.each(function () {
                    var img = $(this);
                    var target = img.closest('div._aagu');
                    if (!target.length) target = img.closest('div[role="button"], div:has(> div > img), div:has(> img)');
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
                        article.find('ul li img, div[role="presentation"] img').filter(function () {
                            return !isAvatarImg($(this));
                        }).each(function () {
                            var sBest = getBestFromSrcset($(this).attr('srcset')) || this.src;
                            if (sBest && !slides.some(function (s) { return s[0] === ensureHzUrl(sBest); })) {
                                slides.push([ensureHzUrl(sBest)]);
                                captions.push($(this).attr('alt') || '');
                            }
                        });

                        if (slides.length > 1) {
                            setPlaceholderGallery(target, slides, captions);
                            setPlaceholderGallery(img, slides, captions);
                        } else {
                            var bestUrl = getBestFromSrcset(img.attr('srcset')) || img.attr('src');
                            if (bestUrl) {
                                var cap = img.attr('alt') || '';
                                setPlaceholderMedia(target, [ensureHzUrl(bestUrl)], cap);
                                setPlaceholderMedia(img, [ensureHzUrl(bestUrl)], cap);
                            }
                        }
                    }

                    if ((target.data().hoverZoomSrc || target.data().hoverZoomGallerySrc) && res.indexOf(target[0]) === -1) res.push(target[0]);
                    if ((img.data().hoverZoomSrc || img.data().hoverZoomGallerySrc) && res.indexOf(img[0]) === -1) res.push(img[0]);
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
                // a playable video takes precedence over its thumbnail (reels & video posts)
                var vUrl = null;
                if (video.length) {
                    var vSrc = video.prop('currentSrc') || video.prop('src') || video.attr('src');
                    if (vSrc && /^https?:/i.test(vSrc)) vUrl = vSrc + '.video';
                }
                if (vUrl) {
                    setPlaceholderMedia(link, [vUrl]);
                } else {
                    var img = link.find('img[src*="cdninstagram"], img[src*="fbcdn"], img[srcset], img[src]').first();
                    if (!img.length) img = link.find('img').first();
                    if (img.length) {
                        var bestUrl = getBestFromSrcset(img.attr('srcset')) || img.attr('src');
                        if (bestUrl) {
                            setPlaceholderMedia(link, [ensureHzUrl(bestUrl)], img.attr('alt') || link.attr('aria-label') || '');
                        }
                    }
                }
            }

            if (link.data().hoverZoomSrc || link.data().hoverZoomGallerySrc) {
                res.push(link[0]);
            }
        });

        // 4. User profile avatars (prepared after the stories below: a story ring must not be
        // handled as a plain profile link)
        function applyProfilePicture(link, user) {
            if (!user || !user.profile_pic_url) return;
            clearFetchedMedia(link);
            link.data().hoverZoomSrc = [ensureHzUrl(user.profile_pic_url)];
            if (user.full_name) link.data().hoverZoomCaption = user.full_name;
            hoverZoom.displayPicFromElement(link);
        }

        // story rings are handled by the stories code below, they must not be replaced by the profile picture
        function isStoryRing(el) {
            if (el.data().hoverZoomStoryBound) return true;
            var storyBound = false;
            el.parents().each(function () {
                if ($(this).data().hoverZoomStoryBound) {
                    storyBound = true;
                    return false;
                }
            });
            if (storyBound) return true;
            if (el.find('canvas').length > 0) return true;
            return el.closest('a[href*="/stories/"], [role="button"]:has(canvas), [role="link"]:has(canvas)').length > 0;
        }

        function bindProfileHover(link, username) {
            if (link.data().hoverZoomProfileBound) return;
            link.data().hoverZoomProfileBound = true;
            link.data().hoverZoomProfileUser = username;

            link.on('mouseenter mouseover', function () {
                var el = $(this);
                el.data().hoverZoomMouseOver = true;
                if (isStoryRing(el)) return;

                var user = usersCache[username];
                if (user) {
                    applyProfilePicture(el, user);
                } else {
                    // hide the display-size avatar: the full-size picture has to replace it
                    awaitFetchedMedia(el);
                    requestUserProfile(username, function (profile) {
                        // story rings are handled by the stories code
                        if (profile && !isStoryRing(el)) applyProfilePicture(el, profile);
                    });
                }
            }).on('mouseleave', function () {
                $(this).data().hoverZoomMouseOver = false;
            });
        }

        // 3. Header reels & highlights (stories)
        function extractStoryUsername(target) {
            if (!target || !target.length) return null;

            // 1. Link href: /stories/<username>/
            var storyLink = target.closest('a[href*="/stories/"]');
            if (!storyLink.length) storyLink = target.find('a[href*="/stories/"]').first();
            if (storyLink.length) {
                var m = (storyLink.attr('href') || '').match(/\/stories\/([^/?#]+)/);
                if (m && m[1] && m[1] !== 'highlights') return m[1];
            }

            // 2. aria-label on target or its immediate button/link
            var candidates = [
                target.attr('aria-label'),
                target.parent().attr('aria-label'),
                target.closest('div[role="button"], button, a').attr('aria-label'),
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

            // 4. Look for text in adjacent/child span in story list item
            var container = target.closest('li, a[href*="/stories/"]');
            if (container.length) {
                var textSpans = container.find('span').filter(function () {
                    var t = $(this).text().trim();
                    return t && !t.includes(' ') && !t.includes('\n') && /^[a-zA-Z0-9._]{1,30}$/.test(t);
                });
                if (textSpans.length) {
                    return textSpans.first().text().trim();
                }
            }

            return null;
        }

        function extractHighlightId(target) {
            if (!target || !target.length) return null;
            var link = target.is('a[href*="/stories/highlights/"]') ? target : target.closest('a[href*="/stories/highlights/"]');
            if (!link.length) link = target.find('a[href*="/stories/highlights/"]').first();
            if (!link.length) return null;
            var m = (link.attr('href') || '').match(/\/stories\/highlights\/(\d+)/);
            return m ? m[1] : null;
        }

        // the cover image of a highlight group was matched against the highlights tray
        function highlightIdFromCover(target) {
            var img = target.is('img') ? target : target.find('img').first();
            var src = img.length ? (img.attr('src') || img.attr('data-src')) : null;
            if (!src && target.attr('style')) {
                var m = target.attr('style').match(/url\(["']?([^"')]+)/);
                if (m) src = m[1];
            }
            var fileKey = coverFileKey(src);
            if (!fileKey) return null;
            var id = mediaMap['hlid_' + fileKey];
            return id ? String(id).replace(/^highlight:/, '') : null;
        }

        // an element is a story entry point when it contains a story ring (canvas), when it shows
        // an avatar or when it links to a story
        function looksLikeOwnerStory(target) {
            if (target.closest('header').length > 0) return true;
            if (target.find('canvas').length > 0) return true;
            var img = target.is('img') ? target : target.find('img').first();
            if (img.length && /profile picture|profile photo|story/i.test(img.attr('alt') || '')) return true;
            return false;
        }

        function getStoryData(target) {
            var highlightId = extractHighlightId(target) || highlightIdFromCover(target);
            var username = highlightId ? null : extractStoryUsername(target);
            // a story ring or an avatar on a profile page belongs to the profile owner
            if (!username && !highlightId && pageUsername && looksLikeOwnerStory(target)) {
                username = pageUsername;
            }
            var storyKey = highlightId ? 'highlight:' + highlightId : username;
            var postData = getStoryFromMap(mediaMap, storyKey);
            if (!postData) {
                var img = target.is('img') ? target : target.find('img').first();
                if (img.length && img.attr('src')) {
                    var fileKey = coverFileKey(img.attr('src'));
                    if (fileKey && mediaMap[fileKey]) {
                        postData = mediaMap[fileKey];
                    }
                }
            }
            return { postData: postData, username: username, highlightId: highlightId, storyKey: storyKey };
        }

        // small icons (menu entries, navigation, footers) are not story or highlight covers
        function isLikelyCover(target) {
            if (target.closest('[role="menu"], [role="menuitem"], nav, footer').length) return false;
            var img = target.is('img') ? target : target.find('img').first();
            if (!img.length) return false;
            var width = parseInt(img.attr('width') || 0, 10);
            var height = parseInt(img.attr('height') || 0, 10);
            if (width && height) return width >= 48 && height >= 48;
            return img.width() >= 48 && img.height() >= 48;
        }

        var storySelector = [
            'a[href*="/stories/"]',
            'img[alt*="profile picture" i]',
            'img[alt*="story" i]',
            '[aria-label*="stor" i] img',
            'header [role="button"] img',
            'ul div[role="button"] img',
            'div[role="menuitem"] img',
            'li[role="menuitem"] img',
            'canvas',
            '[role="button"][style*="background-image"]',
            '[role="link"][style*="background-image"]'
        ].join(', ');

        function prepareStoryTargets() {
            $(storySelector).each(function () {
                var el = $(this);
                if (el.closest('article, a[href*="/p/"], a[href*="/reel/"], a[href*="/reels/"]').length) return;
                var target = el.closest('a[href*="/stories/"], div[role="button"], button');
                if (!target.length) target = el;
                if (target.closest('article, a[href*="/p/"], a[href*="/reel/"], a[href*="/reels/"]').length) return;

                var story = getStoryData(target);
                var isExplicitStory = target.is('a[href*="/stories/"]') || target.closest('a[href*="/stories/"]').length > 0;
                if (!story.storyKey && !story.postData && !isExplicitStory) {
                    // nothing identifies this element as a story (yet): at least let its cover zoom
                    if (isLikelyCover(target)) {
                        var coverImg = target.is('img') ? target : target.find('img').first();
                        var coverUrl = getBestFromSrcset(coverImg.attr('srcset')) || coverImg.attr('src');
                        if (coverUrl) {
                            setPlaceholderMedia(target, [ensureHzUrl(coverUrl)]);
                            if (target.data().hoverZoomSrc) res.push(target[0]);
                        }
                    }
                    return;
                }

                function bindStoryTarget(node) {
                    if (node.data().hoverZoomStoryBound) return;
                    node.data().hoverZoomStoryBound = true;

                    node.on('mouseenter mouseover', function () {
                        if (document.location.href.match('(following|followers)')) return;
                        var link = $(this);
                        link.data().hoverZoomMouseOver = true;

                        var s = getStoryData(link);
                        igLog('instagram: story hover ' + (s.highlightId ? 'highlight:' + s.highlightId : s.username || '(unresolved)') +
                              (s.postData ? ' (cached)' : ''));
                        if (s.storyKey && link.data().hoverZoomStoryKey !== s.storyKey) {
                            link.data().hoverZoomStoryKey = s.storyKey;
                            link.data().hoverZoomStoryUser = s.username;
                            link.data().hoverZoomSrc = undefined;
                            link.data().hoverZoomGallerySrc = undefined;
                            link.data().hoverZoomCaption = undefined;
                        }

                        if (s.postData) {
                            applyMediaToElement(link, s.postData);
                        } else if (s.highlightId || s.username) {
                            // the avatar of a story ring is not the story: hide it while the story is fetched
                            awaitFetchedMedia(link);
                            var showPlaceholder = function () {
                                restorePlaceholder(link);
                            };
                            if (s.highlightId) {
                                requestHighlightData(s.highlightId, showPlaceholder);
                            } else {
                                var user = usersCache[s.username];
                                requestStoryData(s.username, user && user.id, showPlaceholder);
                            }
                        } else {
                            var img = link.is('img') ? link : link.find('img').first();
                            var bestUrl = img.length ? (getBestFromSrcset(img.attr('srcset')) || img.attr('src')) : null;
                            if (bestUrl) {
                                setPlaceholderMedia(link, [ensureHzUrl(bestUrl)]);
                            }
                            document.dispatchEvent(new CustomEvent('hzInstagramStoryRequest', {
                                detail: JSON.stringify({})
                            }));
                        }
                    }).on('mouseleave', function () {
                        $(this).data().hoverZoomMouseOver = false;
                    });
                }

                bindStoryTarget(target);
                if (story.storyKey) {
                    target.data().hoverZoomStoryKey = story.storyKey;
                    // a story link must stay zoomable even when no cover image could be found
                    target.addClass('hoverZoomLink');
                    // the cursor usually rests on the image inside the link: it has to carry the story
                    // too, otherwise hoverZoom would prefer the media stored on it
                    target.find('img').each(function () {
                        bindStoryTarget($(this));
                        $(this).data().hoverZoomStoryKey = story.storyKey;
                    });
                }
                if (story.username) {
                    target.data().hoverZoomStoryUser = story.username;
                }
                if (story.postData) {
                    applyMediaToElement(target, story.postData);
                } else {
                    var img = target.is('img') ? target : target.find('img').first();
                    var bestUrl = img.length ? (getBestFromSrcset(img.attr('srcset')) || img.attr('src')) : null;
                    if (bestUrl) {
                        setPlaceholderMedia(target, [ensureHzUrl(bestUrl)]);
                    }
                }

                if (target.data().hoverZoomSrc || target.data().hoverZoomGallerySrc) {
                    res.push(target[0]);
                }
            });
        }

        prepareStoryTargets();
        // the covers of the highlights of this profile can only be matched once its tray is known
        if (pageUsername) {
            requestHighlightsTray(pageUsername, function () {
                prepareStoryTargets();
            });
        }

        // 4. User profile avatars (see the helpers above)
        $('a[href]').filter(function () {
            return (!/(\/reel\/|\/p\/|\/explore\/|\/stories\/)/.test($(this).prop('href')));
        }).each(function () {
            var link = $(this);
            // stories were bound above and must not be handled as plain profile links
            if (link.data().hoverZoomStoryBound || link.data().hoverZoomStoryKey) return;

            var img = link.find('img').first();
            if (!img.length) return;

            var bestUrl = getBestFromSrcset(img.attr('srcset')) || img.attr('src');
            if (bestUrl) {
                setPlaceholderMedia(link, [ensureHzUrl(bestUrl)], img.attr('alt') || '');
                if (link.data().hoverZoomSrc) res.push(link[0]);
            }

            // upgrade the display-size avatar to the full-size profile picture (as in 0.7)
            var username = usernameFromHref(link.prop('href'));
            if (username) bindProfileHover(link, username);
        });

        var validRes = res.filter(function (el) {
            var d = $(el).data();
            return Boolean((d.hoverZoomSrc && d.hoverZoomSrc.length) || (d.hoverZoomGallerySrc && d.hoverZoomGallerySrc.length));
        });

        callback($(validRes), pluginName);
    }
});
