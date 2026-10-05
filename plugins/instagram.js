var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'Instagram',
    version: '1.2',
    favicon: 'instagram.svg',
    prepareImgLinks: function (callback) {
        const pluginName = this.name;
        var res = [];

        // collect the elements hoverZoom should zoom: a source must exist and duplicates are dropped
        function add(el) {
            if (!el || !el.length) return;
            var d = el.data();
            if (!((d.hoverZoomSrc && d.hoverZoomSrc.length) || (d.hoverZoomGallerySrc && d.hoverZoomGallerySrc.length))) return;
            if (res.indexOf(el[0]) === -1) res.push(el[0]);
        }

        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const upper = lower.toUpperCase();
        const numbers = '0123456789';
        const ig_alphabet = upper + lower + numbers + '-_';

        var mediaIdCache = {};

        function mediaIdfromShortcode(shortcode) {
            if (!shortcode) return '';
            if (mediaIdCache[shortcode] !== undefined) return mediaIdCache[shortcode];
            if (shortcode.length > 11) {
                shortcode = shortcode.substring(0, 11);
            }
            const o = shortcode.replace(/\S/g, m => (ig_alphabet.indexOf(m) >>> 0).toString(2).padStart(6, '0'));
            var mediaId = BigInt('0b' + o).toString(10);
            if (Object.keys(mediaIdCache).length > 200) mediaIdCache = {};
            mediaIdCache[shortcode] = mediaId;
            return mediaId;
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

        // Dynamic helper to get current page profile username in SPA
        function getPageUsername() {
            return usernameFromHref(window.location.href);
        }

        // Avatars, posts and stories are queried through the extension background page: those
        // requests carry the X-IG-App-ID header, use the browser session and are not restricted
        // by the page's CSP/CORS rules (the approach the 0.7 plugin used for profile pages).
        function igRequestHeaders() {
            var headers = [{header: 'X-IG-App-ID', value: '936619743392459'}];
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

        function igSendMessage(url, onResponse) {
            var done = false;
            var timer = setTimeout(function () {
                if (done) return;
                done = true;
                cLog('instagram: no answer for ' + url);
                onResponse(null);
            }, igRequestTimeout);

            var finish = function (response) {
                if (done) return;
                done = true;
                clearTimeout(timer);
                onResponse(typeof response === 'string' ? response : null);
            };

            try {
                chrome.runtime.sendMessage({action: 'ajaxGet', url: url, headers: igRequestHeaders(), credentials: 'include'}, finish);
            } catch (e) {
                cLog('instagram: request failed for ' + url + ' (' + e + ')');
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
                if (!data) cLog('instagram: no JSON from ' + url);
                onData(data);
            });
        }

        function igGetText(url, onText) {
            igSendMessage(url, onText);
        }

        function askPageBridge(eventName, detail) {
            document.dispatchEvent(new CustomEvent(eventName, {detail: JSON.stringify(detail)}));
        }

        function requestOnce(store, key, onUnavailable, run) {
            if (store[key]) {
                if (typeof onUnavailable === 'function') store[key].push(onUnavailable);
                return;
            }
            store[key] = typeof onUnavailable === 'function' ? [onUnavailable] : [];
            run(function (ok) {
                var waiters = store[key] || [];
                delete store[key];
                if (!ok) {
                    for (var i = 0; i < waiters.length; i++) {
                        waiters[i]();
                    }
                }
            });
        }

        function withUserId(username, cb) {
            var id = storyUserId(username);
            if (id) { cb(id); return; }
            requestUserProfile(username, function (user) { cb(user && user.id ? user.id : null); });
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
            askPageBridge('hzInstagramProfileRequest', {username: username});
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

            askPageBridge('hzInstagramFetchRequest', {shortcode: shortcode, mediaId: mediaId});
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

        // Only allow fallback for highlight keys (e.g. highlight:123), NEVER steal another user's story!
        function preferWantedKey(fetched, wantedKey) {
            if (wantedKey && !fetched[wantedKey]) {
                if (/^highlight:/.test(wantedKey)) {
                    for (var k in fetched) {
                        if (/^highlight:/.test(k)) {
                            fetched[wantedKey] = fetched[k];
                            break;
                        }
                    }
                }
            }
        }

        function applyStoryResponse(data, wantedKey) {
            if (!data || !Array.isArray(data.reels_media) || data.reels_media.length === 0) return false;
            var fetched = {};
            processStoriesTray(data, fetched);
            preferWantedKey(fetched, wantedKey);
            return applyStoryMap(fetched);
        }

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
            preferWantedKey(fetched, wantedKey);
            return applyStoryMap(fetched);
        }

        function requestStoryData(username, userId, onUnavailable) {
            if (!username) return;
            var reqKey = 'user:' + String(username).toLowerCase();
            requestOnce(storyRequests, reqKey, onUnavailable, function (finish) {
                var askPage = function (id) {
                    cLog('instagram: asking the page for the story of ' + username + (id ? ' (id ' + id + ')' : ''));
                    askPageBridge('hzInstagramStoryRequest', {username: username, userId: id || userId});
                };

                var tryPage = function (id) {
                    askPage(id);
                    igGetText('https://www.instagram.com/stories/' + encodeURIComponent(username) + '/', function (html) {
                        var ok = applyStoryFromHtml(html, 'story_' + String(username).toLowerCase());
                        finish(ok && !!getStoryFromMap(mediaMap, username));
                    });
                };

                var tryApi = function (id) {
                    cLog('instagram: story of ' + username + ' via reels_media (id ' + id + ')');
                    askPage(id);
                    igGet('https://www.instagram.com/api/v1/feed/reels_media/?reel_ids=' + encodeURIComponent(id), function (data) {
                        if (applyStoryResponse(data, 'story_' + String(username).toLowerCase()) && getStoryFromMap(mediaMap, username)) {
                            finish(true);
                            return;
                        }
                        cLog('instagram: story of ' + username + ' via reels_media failed, trying the story page');
                        tryPage(id);
                    });
                };

                if (userId) {
                    tryApi(userId);
                } else {
                    withUserId(username, function (id) {
                        if (id) {
                            tryApi(id);
                        } else {
                            tryPage(null);
                        }
                    });
                }
            });
        }

        var highlightsTrayRequests = {};

        function requestHighlightsTray(username, onDone) {
            if (!username) return;
            var key = String(username).toLowerCase();
            if (highlightsTrayRequests[key]) return;
            highlightsTrayRequests[key] = true;

            var fetchTray = function (uid) {
                cLog('instagram: highlights tray of ' + username + ' (' + uid + ')');
                askPageBridge('hzInstagramHighlightRequest', {userId: uid});
                igGet('https://www.instagram.com/api/v1/highlights/' + encodeURIComponent(uid) + '/highlights_tray/', function (data) {
                    var fetched = {};
                    if (data) processHighlightsTray(data, fetched);
                    var found = Object.keys(fetched).length > 0;
                    cLog('instagram: highlights tray of ' + username + (found ? ' resolved' : ' empty'));
                    if (found) {
                        mergeMediaData(fetched);
                        if (typeof onDone === 'function') onDone();
                    }
                });
            };

            withUserId(username, function (id) {
                if (id) fetchTray(id);
            });
        }

        function requestHighlightData(highlightId, onUnavailable) {
            if (!highlightId) return;
            var key = 'highlight:' + highlightId;
            requestOnce(storyRequests, key, onUnavailable, function (finish) {
                askPageBridge('hzInstagramHighlightRequest', {highlightId: highlightId});
                igGet('https://www.instagram.com/api/v1/feed/reels_media/?reel_ids=highlight:' + encodeURIComponent(highlightId), function (data) {
                    if (applyStoryResponse(data, key)) {
                        finish(true);
                        return;
                    }
                    igGetText('https://www.instagram.com/stories/highlights/' + encodeURIComponent(highlightId) + '/', function (html) {
                        finish(applyStoryFromHtml(html, key));
                    });
                });
            });
        }

        function refreshMediaElements() {
            $('.hoverZoomLink').each(function () {
                var el = $(this);
                var sc = el.data().hoverZoomShortcode;
                var storyKey = el.data().hoverZoomStoryKey;
                var postData = getPostFromMap(mediaMap, sc) || (storyKey ? getStoryFromMap(mediaMap, storyKey) : null);
                if (!postData) return;

                var applied = sc ? applyPostMediaIfNew(el, sc, postData)
                                 : (storyKey ? applyMediaIfNew(el, 'hoverZoomAppliedStoryKey', storyKey, postData) : false);
                if (applied) {
                    hoverZoom.displayPicFromElement(el);
                }
            });
        }

        function processPayload(payload) {
            if (!payload || !payload.data) return;
            processUserPayload(payload.data);
            var fetched = {};
            processStoriesTray(payload.data, fetched);
            processMediaObject(payload.data, fetched);
            processHighlightsTray(payload.data, fetched);
            var keys = Object.keys(fetched);
            if (keys.length === 0) return;
            cLog('instagram: page bridge delivered ' + keys.length + ' entries (' + String(payload.url).slice(0, 90) + ')');
            mergeMediaData(fetched);
        }

        function mergeMediaData(incoming) {
            if (!incoming) return;
            Object.assign(mediaMap, incoming);
            var incomingKeys = Object.keys(incoming);
            for (var k = 0; k < incomingKeys.length; k++) {
                if (/^(hlid_|story_|uid_)/.test(incomingKeys[k])) {
                    prepareStoryTargets();
                    break;
                }
            }
            trimMediaMap();
            scheduleMediaSave();
            refreshMediaElements();
        }

        var mediaMapMaxEntries = 300;
        var mediaSaveTimer = null;

        function trimMediaMap() {
            var storedKeys = Object.keys(mediaMap);
            if (storedKeys.length <= mediaMapMaxEntries) return;
            for (var i = 0; i < storedKeys.length - mediaMapMaxEntries; i++) {
                delete mediaMap[storedKeys[i]];
            }
        }

        function scheduleMediaSave() {
            if (mediaSaveTimer) return;
            mediaSaveTimer = setTimeout(persistMedia, 500);
        }

        function persistMedia() {
            clearTimeout(mediaSaveTimer);
            mediaSaveTimer = null;
            try {
                sessionStorage.setItem('hzInstagramMedia', JSON.stringify(mediaMap));
            } catch (e) {}
        }

        function processUserPayload(data) {
            var apiUser = data && data.data && data.data.user;
            if (!apiUser || !apiUser.username) return;
            cLog('instagram: profile of ' + apiUser.username + ' via the page bridge');
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

        function mediaFromItem(item, caption, dashManifest) {
            var videoUrl = getBestVideoUrl(item.video_versions, item.video_url, dashManifest);
            if (videoUrl && (item.is_video || item.media_type === 2 || item.video_versions)) {
                return {type: 'video', url: videoUrl + '.video', caption: caption};
            }
            var imgUrl = getBestImageUrl(item.image_versions2, item.display_url, item.display_resources);
            if (imgUrl) {
                return {type: 'image', url: ensureHzUrl(imgUrl), caption: caption};
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
                    var media = mediaFromItem(item, caption, item.video_dash_manifest || item.dash_manifest);
                    if (media) gallery.push([media.url]);
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

            return mediaFromItem(node, caption, node.video_dash_manifest || node.dash_manifest);
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
                var reelId = reel.id ? String(reel.id) : '';
                var isHighlight = /^highlight:/.test(reelId) || reel.reel_type === 'highlight';

                var storyData = null;
                var itemCaption = function (item) {
                    return (item.caption && (typeof item.caption === 'string' ? item.caption : item.caption.text)) || (username || '');
                };
                if (items.length > 1) {
                    var gallery = [];
                    var captions = [];
                    for (var j = 0; j < items.length; j++) {
                        var media = mediaFromItem(items[j], itemCaption(items[j]));
                        if (media) gallery.push([media.url]);
                        captions.push(itemCaption(items[j]));
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
                    storyData = mediaFromItem(items[0], itemCaption(items[0]));
                }

                if (storyData) {
                    if (isHighlight && reelId) {
                        map[reelId] = storyData;
                    } else if (username) {
                        var uLow = String(username).toLowerCase();
                        map['story_' + uLow] = storyData;
                        map[uLow] = storyData;
                        map['story_' + username] = storyData;
                        map[username] = storyData;
                    }
                }
            }
        }

        function coverFileKey(url) {
            if (!url || typeof url !== 'string') return null;
            var m = url.match(/([^\/?#]+\.jpg)/);
            return m ? m[1] : null;
        }

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

        var mediaRank = {image: 1, video: 2, carousel: 3};

        function storePost(map, key, postData) {
            if (!key || !postData) return;
            var existing = map[key];
            var better = !existing ||
                         (mediaRank[postData.type] || 0) > (mediaRank[existing.type] || 0) ||
                         (postData.type === 'image' && existing.type === 'image');
            if (better) map[key] = postData;
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

        var placeholderRestoreDelay = 2500;

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

        function resetGallery(el) {
            el.data().hoverZoomGallerySrc = undefined;
            el.data().hoverZoomGalleryIndex = undefined;
            el.data().hoverZoomGalleryCaption = undefined;
        }

        function setPlaceholderMedia(el, src, caption) {
            if (el.data().hoverZoomFetchPending) return;
            el.data().hoverZoomSrc = src;
            if (caption !== undefined) el.data().hoverZoomCaption = caption;
            resetGallery(el);
        }

        function bestImgUrl(img) {
            return getBestFromSrcset(img.attr('srcset')) || img.attr('src') || null;
        }

        function placeholderFromImg(el, img, caption) {
            var best = bestImgUrl(img);
            if (!best) return false;
            setPlaceholderMedia(el, [ensureHzUrl(best)], caption);
            return true;
        }

        function setGallery(el, gallery, captions, fallbackCaption) {
            var idx = el.data().hoverZoomGalleryIndex;
            if (typeof idx !== 'number' || idx < 0 || idx >= gallery.length) idx = 0;
            el.data().hoverZoomGallerySrc = gallery;
            el.data().hoverZoomGalleryIndex = idx;
            el.data().hoverZoomGalleryCaption = captions;
            el.data().hoverZoomSrc = gallery[idx];
            el.data().hoverZoomCaption = (captions && captions[idx]) || fallbackCaption || '';
        }

        function setPlaceholderGallery(el, gallery, captions) {
            if (el.data().hoverZoomFetchPending) return;
            setGallery(el, gallery, captions);
        }

        function applyMediaToElement(el, postData) {
            if (!postData) return;
            clearFetchedMedia(el);
            if (postData.type === 'carousel' && postData.gallery && postData.gallery.length > 0) {
                var ensuredGallery = postData.gallery.map(function (slide) {
                    return slide.map(ensureHzUrl);
                });
                setGallery(el, ensuredGallery, postData.captions, postData.caption);
            } else if (postData.url) {
                el.data().hoverZoomSrc = [ensureHzUrl(postData.url)];
                el.data().hoverZoomCaption = postData.caption || '';
                resetGallery(el);
            }
        }

        function applyMediaIfNew(el, marker, value, postData) {
            if (!postData) return false;
            var currUrl = el.data().hoverZoomSrc && el.data().hoverZoomSrc[0];
            var newUrl = postData.url ? ensureHzUrl(postData.url) : (postData.gallery && postData.gallery[0] && ensureHzUrl(postData.gallery[0][0]));
            if (el.data()[marker] !== value || currUrl !== newUrl) {
                el.data()[marker] = value;
                applyMediaToElement(el, postData);
                return true;
            }
            return false;
        }

        function applyPostMediaIfNew(el, shortcode, postData) {
            return shortcode ? applyMediaIfNew(el, 'hoverZoomAppliedShortcode', shortcode, postData) : false;
        }

        // Extracts username supporting both straight ' and curly ’ (U+2019)
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

        var mediaJsonMarker = /image_versions2|display_url|display_resources|video_versions|video_url|carousel_media|edge_sidecar|reels_media|"tray"|cover_media|reel_type|"username"|"pk"/;
        $('script[type="application/json"]').each(function () {
            if (this.__hzInstagramScanned) return;
            this.__hzInstagramScanned = true;
            var text = this.textContent;
            if (!text || !mediaJsonMarker.test(text)) return;
            try {
                var j = JSON.parse(text);
                processStoriesTray(j, mediaMap);
                processMediaObject(j, mediaMap);
                processHighlightsTray(j, mediaMap);
            } catch (e) {}
        });

        // Inject the page-world bridge
        if (!window.__hzInstagramBridgeInjected && typeof chrome.runtime.getURL === 'function') {
            window.__hzInstagramBridgeInjected = true;
            var hookScript = document.createElement('script');
            hookScript.className = 'hoverZoomHookIG';
            hookScript.src = chrome.runtime.getURL('js/hoverZoomInstagramHook.js');
            hookScript.onerror = function () {
                cLog('instagram: page bridge could not be loaded');
            };
            (document.head || document.documentElement).appendChild(hookScript);
        }

        // Listen for payloads delivered by the page bridge and scroll
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
            }).on('pagehide', persistMedia);
        }

        // Watch for SPA URL changes in Instagram
        if (!window.__hzInstagramUrlWatcher) {
            window.__hzInstagramUrlWatcher = true;
            var lastHref = window.location.href;
            setInterval(function () {
                if (window.location.href !== lastHref) {
                    lastHref = window.location.href;
                    var newPageUser = getPageUsername();
                    if (newPageUser) {
                        requestHighlightsTray(newPageUser, function () {
                            prepareStoryTargets();
                        });
                    }
                    prepareStoryTargets();
                    if (typeof hoverZoom.prepareImgLinksAsync === 'function') {
                        hoverZoom.prepareImgLinksAsync();
                    }
                }
            }, 500);
        }

        function holdNativeVideo(video) {
            clearTimeout(video._hzResumeTimeout);
            if (!video.paused) {
                video._hzWasPlaying = true;
            }
            video.pause();
            clearInterval(video._hzPauseInterval);
            video._hzPauseInterval = setInterval(function () {
                if (video._hzHoverCount > 0 && !video.paused) {
                    video.pause();
                }
            }, 250);
        }

        function releaseNativeVideo(video) {
            video._hzHoverCount = Math.max(0, (video._hzHoverCount || 1) - 1);
            if (video._hzHoverCount > 0) return;
            clearInterval(video._hzPauseInterval);
            if (!video._hzWasPlaying) return;
            clearTimeout(video._hzResumeTimeout);
            video._hzResumeTimeout = setTimeout(function () {
                if (video._hzHoverCount === 0 && video._hzWasPlaying) {
                    video._hzWasPlaying = false;
                    video.play().catch(function () {});
                }
            }, 50);
        }

        function bindHover(el, shortcode, nativeVideo) {
            if (el.data().hoverZoomBound) return;
            el.data().hoverZoomBound = true;
            if (shortcode) el.data().hoverZoomShortcode = shortcode;

            el.on('mouseenter mouseover', function () {
                var link = $(this);
                var wasOver = link.data().hoverZoomMouseOver;
                link.data().hoverZoomMouseOver = true;

                if (nativeVideo && typeof nativeVideo.pause === 'function') {
                    if (!wasOver) {
                        nativeVideo._hzHoverCount = (nativeVideo._hzHoverCount || 0) + 1;
                    }
                    holdNativeVideo(nativeVideo);
                }

                var sc = link.data().hoverZoomShortcode;
                if (sc) {
                    var postData = getPostFromMap(mediaMap, sc);
                    if (postData && (postData.type === 'video' || (!nativeVideo && (postData.url || postData.gallery)))) {
                        applyPostMediaIfNew(link, sc, postData);
                    } else {
                        awaitFetchedMedia(link);
                        requestPostData(sc);
                    }
                }
            }).on('mouseleave', function () {
                var link = $(this);
                if (!link.data().hoverZoomMouseOver) return;
                link.data().hoverZoomMouseOver = false;

                if (nativeVideo && typeof nativeVideo.play === 'function') {
                    releaseNativeVideo(nativeVideo);
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
                var avCaption = avatarImg.attr('alt') || '';
                if (placeholderFromImg(avTarget, avatarImg, avCaption)) {
                    placeholderFromImg(avatarImg, avatarImg, avCaption);
                    add(avTarget);
                    add(avatarImg);
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

                add(vTarget);
                add(video);
                add(posterImg);
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
                            var cap = img.attr('alt') || '';
                            if (placeholderFromImg(target, img, cap)) {
                                placeholderFromImg(img, img, cap);
                            }
                        }
                    }

                    add(target);
                    add(img);
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
                        placeholderFromImg(link, img, img.attr('alt') || link.attr('aria-label') || '');
                    }
                }
            }

            add(link);
        });

        function applyProfilePicture(link, user) {
            if (!user || !user.profile_pic_url) return;
            clearFetchedMedia(link);
            link.data().hoverZoomSrc = [ensureHzUrl(user.profile_pic_url)];
            if (user.full_name) link.data().hoverZoomCaption = user.full_name;
            hoverZoom.displayPicFromElement(link);
        }

        // Story ring detection: includes canvas, svg ring, aria-label, stories link, or header button with canvas/svg
        function isStoryRing(el) {
            if (el.data().hoverZoomStoryBound || el.data().hoverZoomStoryKey) return true;
            var storyBound = false;
            el.parents().each(function () {
                if ($(this).data().hoverZoomStoryBound || $(this).data().hoverZoomStoryKey) {
                    storyBound = true;
                    return false;
                }
            });
            if (storyBound) return true;
            if (el.find('canvas').length > 0) return true;
            if (el.closest('header [role="button"]').length > 0 && el.closest('header').find('canvas, [aria-label*="stor" i]').length > 0) return true;
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
                    awaitFetchedMedia(el);
                    requestUserProfile(username, function (profile) {
                        if (profile && !isStoryRing(el)) applyProfilePicture(el, profile);
                    });
                }
            }).on('mouseleave', function () {
                $(this).data().hoverZoomMouseOver = false;
            });
        }

        function extractStoryUsername(target) {
            if (!target || !target.length) return null;

            // 1. Link href: /stories/<username>/
            var storyLink = target.closest('a[href*="/stories/"]');
            if (!storyLink.length) storyLink = target.find('a[href*="/stories/"]').first();
            if (storyLink.length) {
                var m = (storyLink.attr('href') || '').match(/\/stories\/([^/?#]+)/);
                if (m && m[1] && m[1] !== 'highlights') return m[1];
            }

            // 2. aria-label on target or its button/link ancestors
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
                var u2 = matchStoryUsername(img.attr('alt'));
                if (u2) return u2;
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

            // 5. If in header of a profile page, it belongs to the profile owner
            var curPageUser = getPageUsername();
            if (curPageUser && target.closest('header').length > 0) {
                return curPageUser;
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
            var curPageUser = getPageUsername();
            if (!username && !highlightId && curPageUser && looksLikeOwnerStory(target)) {
                username = curPageUser;
            }
            var storyKey = highlightId ? 'highlight:' + highlightId : username;
            var postData = getStoryFromMap(mediaMap, storyKey);
            return { postData: postData, username: username, highlightId: highlightId, storyKey: storyKey };
        }

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

        // 3. Story rings, highlight covers and the profile header stories
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
                    if (isLikelyCover(target)) {
                        var coverImg = target.is('img') ? target : target.find('img').first();
                        if (placeholderFromImg(target, coverImg)) {
                            add(target);
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
                        cLog('instagram: story hover ' + (s.highlightId ? 'highlight:' + s.highlightId : s.username || '(unresolved)') +
                              (s.postData ? ' (cached)' : ''));

                        // When switching users or when username changed (fixes 1st person's story showing on 2nd person)
                        if (s.storyKey && (link.data().hoverZoomStoryKey !== s.storyKey || link.data().hoverZoomStoryUser !== s.username)) {
                            link.data().hoverZoomStoryKey = s.storyKey;
                            link.data().hoverZoomStoryUser = s.username;
                            link.data().hoverZoomSrc = undefined;
                            link.data().hoverZoomGallerySrc = undefined;
                            link.data().hoverZoomGalleryIndex = 0;
                            link.data().hoverZoomCaption = undefined;
                            link.find('img').each(function () {
                                $(this).data().hoverZoomStoryKey = s.storyKey;
                                $(this).data().hoverZoomStoryUser = s.username;
                                $(this).data().hoverZoomSrc = undefined;
                                $(this).data().hoverZoomGallerySrc = undefined;
                                $(this).data().hoverZoomGalleryIndex = 0;
                            });
                            closeDisplayedMedia();
                        }

                        if (s.postData) {
                            applyMediaToElement(link, s.postData);
                        } else if (s.highlightId || s.username) {
                            // Hide the placeholder avatar while the story is fetched
                            awaitFetchedMedia(link);
                            var showPlaceholder = function () {
                                // If the story fetch failed or user has no active stories, show profile pic
                                restorePlaceholder(link);
                            };
                            if (s.highlightId) {
                                requestHighlightData(s.highlightId, showPlaceholder);
                            } else {
                                var user = usersCache[s.username];
                                requestStoryData(s.username, user && user.id, showPlaceholder);
                            }
                        } else {
                            placeholderFromImg(link, link.is('img') ? link : link.find('img').first());
                            askPageBridge('hzInstagramStoryRequest', {});
                        }
                    }).on('mouseleave', function () {
                        $(this).data().hoverZoomMouseOver = false;
                    });
                }

                bindStoryTarget(target);
                if (story.storyKey) {
                    // Update key and user in case element was reused across SPA page transitions
                    target.data().hoverZoomStoryKey = story.storyKey;
                    target.addClass('hoverZoomLink');
                    target.find('img').each(function () {
                        bindStoryTarget($(this));
                        $(this).data().hoverZoomStoryKey = story.storyKey;
                    });
                }
                if (story.username) {
                    target.data().hoverZoomStoryUser = story.username;
                    target.find('img').each(function () {
                        $(this).data().hoverZoomStoryUser = story.username;
                    });
                }
                if (story.postData) {
                    applyMediaToElement(target, story.postData);
                } else {
                    placeholderFromImg(target, target.is('img') ? target : target.find('img').first());
                }

                add(target);
            });
        }

        prepareStoryTargets();

        var initialPageUser = getPageUsername();
        if (initialPageUser) {
            requestHighlightsTray(initialPageUser, function () {
                prepareStoryTargets();
            });
        }

        // 4. Profile avatars (plain links to /<username>/)
        $('a[href]').filter(function () {
            return (!/(\/reel\/|\/p\/|\/explore\/|\/stories\/)/.test($(this).prop('href')));
        }).each(function () {
            var link = $(this);
            if (link.data().hoverZoomStoryBound || link.data().hoverZoomStoryKey) return;

            var img = link.find('img').first();
            if (!img.length) return;

            if (placeholderFromImg(link, img, img.attr('alt') || '')) {
                add(link);
            }

            var username = usernameFromHref(link.prop('href'));
            if (username) bindProfileHover(link, username);
        });

        callback($(res), pluginName);
    }
});
