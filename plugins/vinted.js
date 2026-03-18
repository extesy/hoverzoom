var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'vinted',
    version:'0.8',
    prepareImgLinks:function (callback) {

        var name = this.name;
        var plug = this;
        var res = [];
        var itemFetchDelay = 150;
        var wardrobePageSize = 20;
        var catalogSelector = 'a.new-item-box__overlay, div.new-item-box__container, img[src*="vinted.net"][class*="Image__content"]';

        // Inject the page-world fetch/XHR hook once so we can read Vinted's
        // listing responses and replay wardrobe requests with first-party cookies.
        if (!plug._hookInjected) {
            plug._hookInjected = true;

            var script = document.createElement('script');
            script.src = chrome.runtime.getURL('js/hoverZoomVintedFetch.js');
            (document.head || document.documentElement).appendChild(script);

            document.addEventListener('hzVintedApiData', function () {
                cLog('[vinted] API data received via fetch hook');
                readApiData();
            });

            document.addEventListener('hzVintedWardrobeData', function (event) {
                handleWardrobeResponse(event.detail);
            });
        }

        // Seed gallery and item-id caches from SSR and intercepted API payloads.
        buildGalleryMap();

        // Handle feed cards lazily because Vinted keeps appending new ones as you scroll.
        if (!plug._delegateSetup) {
            plug._delegateSetup = true;

            $(document.body).on('mouseenter',
                catalogSelector,
                function () {
                    readApiData();

                    var context = resolveItemContext($(this));
                    if (!context) return;

                    clearScheduledFetch(context.itemUrl);
                    plug._activeTargets[context.itemUrl] = context.target;
                    plug._hoveredItems[context.itemUrl] = true;

                    if (context.target.data().hoverZoomSrc || context.target.data().hoverZoomGallerySrc) return;

                    var gallery = plug._hashToGallery[context.hash];
                    if (gallery && gallery.length > 0) {
                        cLog('[vinted] Applying gallery (' + gallery.length + ' photos) for hash ' + context.hash);
                        applyResolvedGallery(context.target, gallery, true);
                        return;
                    }

                    if (plug._pendingItems[context.itemUrl]) return;

                    scheduleItemFetch(context);
                }
            ).on('mouseleave',
                catalogSelector,
                function () {
                    var context = resolveItemContext($(this));
                    if (!context) return;

                    plug._hoveredItems[context.itemUrl] = false;
                    clearScheduledFetch(context.itemUrl);
                    removeWardrobeWaiter(context.itemUrl);
                    cleanupItemState(context.itemUrl);
                }
            );
        }

        // Detail pages already expose the full image set, so process them eagerly.
        var detailPhotos = $('figure.item-photo img[src*="vinted.net"], button.item-thumbnail img[src*="vinted.net"]');
        var detailGallery = extractVisibleGallery(detailPhotos);
        if (detailPhotos.length > 0) {
            var detailHash = extractHash(detailPhotos[0].src);
            var embeddedGallery = plug._hashToGallery[detailHash];
            if (embeddedGallery && embeddedGallery.length >= detailGallery.length) {
                detailGallery = embeddedGallery;
            }
        }

        $('figure.item-photo:not(.hoverZoomMouseover), button.item-thumbnail:not(.hoverZoomMouseover)')
            .addClass('hoverZoomMouseover')
            .each(function () {
                var el = $(this),
                    img = el.find('img[src*="vinted.net"]');
                if (!img.length || detailGallery.length === 0) return;

                applyGallery(el, detailGallery);
                res.push(el);
            });

        callback($(res), name);

        function extractHash(url) {
            if (!url) return null;
            var m = url.match(/vinted\.net\/t(?:c)?\/([^/]+)\//);
            return m ? m[1] : null;
        }

        function extractItemId(url) {
            if (!url) return null;
            var m = url.match(/\/items\/(\d+)/);
            return m ? m[1] : null;
        }

        function normalizeItemUrl(url) {
            if (!url) return null;
            var itemUrl = url.indexOf('http') === 0 ? url : location.origin + url;
            return itemUrl.split('?')[0];
        }

        function findItemLink(el) {
            var link = el.closest('.new-item-box__container').find('a[href*="/items/"]');
            if (!link.length) link = el.closest('.new-item-box__image-container').find('a[href*="/items/"]');
            if (!link.length && el.is('a') && el.attr('href') && el.attr('href').indexOf('/items/') !== -1) link = el;
            return link.length ? link : null;
        }

        function resolveItemContext(el) {
            var target, hash, img;

            if (el[0].tagName === 'IMG') {
                hash = extractHash(el[0].src);
                var container = el.closest('.new-item-box__container, figure.item-photo, button.item-thumbnail');
                target = container.length ? container : el;
            } else if (el.hasClass('new-item-box__overlay')) {
                var parent = el.closest('.new-item-box__image-container');
                if (!parent.length) return null;
                img = parent.find('img[src*="vinted.net"]');
                if (!img.length) return null;
                hash = extractHash(img.attr('src'));
                target = el;
            } else {
                img = el.find('img[src*="vinted.net"]');
                if (!img.length) return null;
                hash = extractHash(img.attr('src'));
                target = el;
            }

            if (!hash || !target || !target.length) return null;

            var link = findItemLink(el);
            if (!link) return null;

            var href = link.attr('href');
            var itemUrl = normalizeItemUrl(href);
            if (!itemUrl) return null;

            var itemId = extractItemId(itemUrl);
            if (!itemId) return null;

            var useWardrobeApi = href.indexOf('homepage_session_id=') !== -1 ||
                (location.pathname === '/' && el.closest('.homepage-blocks__item, [data-testid="feed-item"]').length > 0);

            return {
                hash:hash,
                itemId:itemId,
                itemUrl:itemUrl,
                userId:plug._itemIdToUserId[itemId],
                useWardrobeApi:useWardrobeApi,
                target:target
            };
        }

        function applyGallery(el, gallery) {
            if (gallery.length > 1) {
                el.data().hoverZoomGallerySrc = gallery.map(function (u) { return [u]; });
            } else {
                el.data().hoverZoomSrc = [gallery[0]];
            }
        }

        function applyResolvedGallery(target, gallery, displayNow) {
            if (!target || !target.length || !gallery || gallery.length === 0) return;

            if (!target.data().hoverZoomSrc && !target.data().hoverZoomGallerySrc) {
                applyGallery(target, gallery);
                callback(target, name);
            }

            if (displayNow) {
                hoverZoom.displayPicFromElement(target);
            }
        }

        // Read intercepted API data from sessionStorage (deposited by fetch hook)
        function readApiData() {
            try {
                var data = sessionStorage.getItem('hzVintedApiData');
                if (data) {
                    sessionStorage.removeItem('hzVintedApiData');
                    cLog('[vinted] Parsing intercepted API data (' + data.length + ' bytes)');
                    ingestData(data);
                }
            } catch (e) {
                cLog('[vinted] Failed to read intercepted API data: ' + e);
            }
        }

        function pushUnique(list, value) {
            if (value && list.indexOf(value) === -1) {
                list.push(value);
            }
        }

        function clearScheduledFetch(itemUrl) {
            if (!plug._fetchTimers[itemUrl]) return;
            clearTimeout(plug._fetchTimers[itemUrl]);
            delete plug._fetchTimers[itemUrl];
        }

        function clearWardrobeRequest(requestId) {
            if (plug._wardrobeRequestTimeouts[requestId]) {
                clearTimeout(plug._wardrobeRequestTimeouts[requestId]);
                delete plug._wardrobeRequestTimeouts[requestId];
            }

            delete plug._wardrobeRequestCallbacks[requestId];
        }

        function handleWardrobeResponse(detail) {
            if (!detail) return;

            try {
                if (typeof detail === 'string') {
                    detail = JSON.parse(detail);
                }
            } catch (e) {
                cLog('[vinted] Failed to parse wardrobe event payload: ' + e);
                return;
            }

            if (!detail || !detail.requestId || !detail.storageKey) return;

            var payload = null;

            try {
                payload = sessionStorage.getItem(detail.storageKey);
                if (payload) {
                    sessionStorage.removeItem(detail.storageKey);
                    payload = JSON.parse(payload);
                }
            } catch (e) {
                cLog('[vinted] Failed to read wardrobe response payload: ' + e);
                payload = null;
            }

            var responseCallback = plug._wardrobeRequestCallbacks[detail.requestId];
            clearWardrobeRequest(detail.requestId);

            if (responseCallback) {
                responseCallback(payload);
            }
        }

        function requestWardrobePage(url, callback) {
            var requestId = 'wardrobe:' + (++plug._wardrobeRequestSeq);

            plug._wardrobeRequestCallbacks[requestId] = callback;
            plug._wardrobeRequestTimeouts[requestId] = setTimeout(function () {
                var timedOut = plug._wardrobeRequestCallbacks[requestId];
                clearWardrobeRequest(requestId);

                if (timedOut) {
                    timedOut(null);
                }
            }, 15000);

            document.dispatchEvent(new CustomEvent('hzVintedWardrobeRequest', {
                detail:JSON.stringify({
                    requestId:requestId,
                    url:url
                })
            }));
        }

        function cleanupItemState(itemUrl) {
            if (plug._pendingItems[itemUrl] || plug._fetchTimers[itemUrl] || plug._hoveredItems[itemUrl]) return;
            delete plug._hoveredItems[itemUrl];
            delete plug._activeTargets[itemUrl];
        }

        function getWardrobeState(userId) {
            userId = String(userId);

            if (!plug._wardrobeCatalogs[userId]) {
                plug._wardrobeCatalogs[userId] = {
                    crawling:false,
                    complete:false,
                    itemGalleries:{},
                    nextPage:1,
                    pagesFetched:{},
                    totalPages:null
                };
            }

            return plug._wardrobeCatalogs[userId];
        }

        function removeWardrobeWaiter(itemUrl) {
            if (!plug._wardrobeWaiters[itemUrl]) return;
            delete plug._wardrobeWaiters[itemUrl];
            delete plug._pendingItems[itemUrl];
        }

        function hasWardrobeWaiters(userId) {
            userId = String(userId);

            for (var itemUrl in plug._wardrobeWaiters) {
                if (plug._wardrobeWaiters[itemUrl].userId === userId) {
                    return true;
                }
            }

            return false;
        }

        function buildWardrobeApiUrl(userId, page) {
            return '/api/v2/wardrobe/' + userId +
                '/items?page=' + page +
                '&per_page=' + wardrobePageSize +
                '&order=newest_first';
        }

        function registerGalleryUrls(urls, gallery) {
            var map = plug._hashToGallery;

            for (var i = 0; i < urls.length; i++) {
                var hash = extractHash(urls[i]);
                if (hash) {
                    map[hash] = gallery;
                }
            }
        }

        function buildGalleryFromPhotos(photos) {
            var gallery = [];
            var urls = [];

            if (!Array.isArray(photos)) return gallery;

            for (var i = 0; i < photos.length; i++) {
                var photo = photos[i];
                if (!photo || photo.is_hidden) continue;

                var galleryUrl = photo.full_size_url || photo.url;
                pushUnique(gallery, galleryUrl);
                pushUnique(urls, galleryUrl);
                pushUnique(urls, photo.url);

                var thumbnails = photo.thumbnails;
                if (!Array.isArray(thumbnails)) continue;

                for (var j = 0; j < thumbnails.length; j++) {
                    pushUnique(urls, thumbnails[j] && thumbnails[j].url);
                }
            }

            if (gallery.length > 0) {
                registerGalleryUrls(urls, gallery);
            }

            return gallery;
        }

        function resolveWardrobeWaiters(userId, itemId, gallery) {
            userId = String(userId);
            itemId = String(itemId);

            for (var itemUrl in plug._wardrobeWaiters) {
                var waiter = plug._wardrobeWaiters[itemUrl];
                if (waiter.userId !== userId || waiter.itemId !== itemId) continue;

                delete plug._wardrobeWaiters[itemUrl];
                delete plug._pendingItems[itemUrl];

                applyResolvedGallery(plug._activeTargets[itemUrl], gallery, !!plug._hoveredItems[itemUrl]);
                cleanupItemState(itemUrl);
            }
        }

        function failWardrobeWaiters(userId) {
            userId = String(userId);

            for (var itemUrl in plug._wardrobeWaiters) {
                var waiter = plug._wardrobeWaiters[itemUrl];
                if (waiter.userId !== userId) continue;

                delete plug._wardrobeWaiters[itemUrl];
                delete plug._pendingItems[itemUrl];
                cleanupItemState(itemUrl);
            }
        }

        function fetchWardrobePage(userId, page, callback) {
            var url = buildWardrobeApiUrl(userId, page);
            cLog('[vinted] Fetching wardrobe page: ' + url);

            requestWardrobePage(url, function (response) {
                if (response == null || !response.ok || !response.text) {
                    callback(null);
                    return;
                }

                try {
                    callback(JSON.parse(response.text));
                } catch (e) {
                    cLog('[vinted] Failed to parse wardrobe response for user ' + userId + ', page ' + page + ': ' + e);
                    callback(null);
                }
            });
        }

        function crawlWardrobe(userId) {
            userId = String(userId);

            var state = getWardrobeState(userId);
            if (state.crawling) return;

            state.crawling = true;

            function finish() {
                state.crawling = false;
            }

            function nextPage() {
                if (!hasWardrobeWaiters(userId)) {
                    finish();
                    return;
                }

                if (state.complete) {
                    finish();
                    failWardrobeWaiters(userId);
                    return;
                }

                var page = state.nextPage;
                if (state.totalPages !== null && page > state.totalPages) {
                    state.complete = true;
                    finish();
                    failWardrobeWaiters(userId);
                    return;
                }

                if (state.pagesFetched[page]) {
                    state.nextPage = page + 1;
                    nextPage();
                    return;
                }

                fetchWardrobePage(userId, page, function (data) {
                    if (!data || !Array.isArray(data.items)) {
                        finish();
                        failWardrobeWaiters(userId);
                        return;
                    }

                    state.pagesFetched[page] = true;

                    var totalPages = parseInt(data.pagination && data.pagination.total_pages, 10);
                    state.totalPages = totalPages > 0 ? totalPages : page;
                    state.nextPage = page + 1;

                    for (var i = 0; i < data.items.length; i++) {
                        var item = data.items[i];
                        if (!item || !item.id) continue;

                        var itemId = String(item.id);
                        var itemUserId = String(item.user_id || (item.user && item.user.id) || userId);
                        var gallery = buildGalleryFromPhotos(item.photos);

                        plug._itemIdToUserId[itemId] = itemUserId;

                        if (gallery.length > 0) {
                            state.itemGalleries[itemId] = gallery;
                            resolveWardrobeWaiters(itemUserId, itemId, gallery);
                        }
                    }

                    if (!hasWardrobeWaiters(userId)) {
                        finish();
                        return;
                    }

                    if (state.nextPage > state.totalPages) {
                        state.complete = true;
                        finish();
                        failWardrobeWaiters(userId);
                        return;
                    }

                    nextPage();
                });
            }

            nextPage();
        }

        function queueWardrobeLookup(context) {
            var userId = String(context.userId);
            var itemId = String(context.itemId);
            var state = getWardrobeState(userId);
            var gallery = state.itemGalleries[itemId];

            if (gallery && gallery.length > 0) {
                applyResolvedGallery(plug._activeTargets[context.itemUrl] || context.target, gallery, true);
                cleanupItemState(context.itemUrl);
                return;
            }

            if (state.complete) {
                cleanupItemState(context.itemUrl);
                return;
            }

            plug._wardrobeWaiters[context.itemUrl] = {
                itemId:itemId,
                userId:userId
            };
            plug._pendingItems[context.itemUrl] = true;

            crawlWardrobe(userId);
        }

        function scheduleItemFetch(context) {
            plug._fetchTimers[context.itemUrl] = setTimeout(function () {
                delete plug._fetchTimers[context.itemUrl];

                if (!plug._hoveredItems[context.itemUrl]) {
                    cleanupItemState(context.itemUrl);
                    return;
                }

                readApiData();
                context.userId = context.userId || plug._itemIdToUserId[context.itemId];

                var gallery = plug._hashToGallery[context.hash];
                if (gallery && gallery.length > 0) {
                    applyResolvedGallery(plug._activeTargets[context.itemUrl] || context.target, gallery, true);
                    cleanupItemState(context.itemUrl);
                    return;
                }

                if (context.useWardrobeApi) {
                    if (context.userId) {
                        queueWardrobeLookup(context);
                    } else {
                        cLog('[vinted] Missing user id for homepage item ' + context.itemId);
                        cleanupItemState(context.itemUrl);
                    }
                    return;
                }

                fetchItemPage(context.itemUrl, context.hash);
            }, itemFetchDelay);
        }

        function extractVisibleGallery(photos) {
            var gallery = [];
            photos.each(function () {
                pushUnique(gallery, this.src);
            });
            return gallery;
        }

        // Find the matching closing delimiter while ignoring brackets/braces inside strings.
        function findStructureEnd(text, start, openChar, closeChar) {
            var depth = 0;
            var inString = false;
            var escaped = false;

            for (var i = start; i < text.length; i++) {
                var ch = text[i];

                if (inString) {
                    if (escaped) {
                        escaped = false;
                        continue;
                    }

                    if (ch === '\\') {
                        escaped = true;
                        continue;
                    }

                    if (ch === '"') {
                        inString = false;
                    }
                    continue;
                }

                if (ch === '"') {
                    inString = true;
                    continue;
                }

                if (ch === openChar) depth++;
                else if (ch === closeChar) depth--;

                if (depth === 0) return i;
            }

            return -1;
        }

        function findArrayEnd(text, arrStart) {
            return findStructureEnd(text, arrStart, '[', ']');
        }

        function findObjectEnd(text, objStart) {
            return findStructureEnd(text, objStart, '{', '}');
        }

        function normalizeText(text) {
            return text.replace(/\\"/g, '"').replace(/\\\//g, '/').replace(/\\u002f/gi, '/');
        }

        function extractGalleryUrls(text) {
            var gallery = [];
            var re = /"url"\s*:\s*"(https:\/\/images\d*\.vinted\.net\/t(?:c)?\/[^/]+\/f800\/[^"]+)"/g;
            var match;

            while ((match = re.exec(text)) !== null) {
                pushUnique(gallery, match[1]);
            }

            return gallery;
        }

        function parseItemMetadata(text, isNormalized) {
            var src = isNormalized ? text : normalizeText(text);
            var re = /"type"\s*:\s*"item"\s*,\s*"entity"\s*:\s*\{/g;
            var match;

            while ((match = re.exec(src)) !== null) {
                var objStart = src.indexOf('{', match.index);
                if (objStart === -1) continue;

                var objEnd = findObjectEnd(src, objStart);
                if (objEnd === -1) continue;

                re.lastIndex = objEnd + 1;

                var block = src.substring(objStart, objEnd + 1);
                var itemIdMatch = block.match(/"id"\s*:\s*(\d+)/);
                var userIdMatch =
                    block.match(/"user_id"\s*:\s*(\d+)/) ||
                    block.match(/"user"\s*:\s*\{[^{}]*"id"\s*:\s*(\d+)/);
                if (!itemIdMatch || !userIdMatch) continue;

                plug._itemIdToUserId[itemIdMatch[1]] = userIdMatch[1];
            }
        }

        function registerGalleryHashes(text, gallery) {
            var urls = [];
            var re = /https:\/\/images\d*\.vinted\.net\/t(?:c)?\/[^"]+/g;
            var match;

            while ((match = re.exec(text)) !== null) {
                pushUnique(urls, match[0]);
            }

            registerGalleryUrls(urls, gallery);
        }

        function ingestData(text) {
            var src = normalizeText(text);
            parseItemMetadata(src, true);
            parsePhotos(src, true);
        }

        // Build the cache from all available sources.
        function buildGalleryMap() {
            // 1. Parse SSR data embedded in page scripts.
            var scripts = document.querySelectorAll('script');
            for (var i = 0; i < scripts.length; i++) {
                var text = scripts[i].textContent;
                if (!text || text.length < 500) continue;
                if (text.indexOf('f800') === -1 &&
                    text.indexOf('"photos"') === -1 &&
                    text.indexOf('\\"photos\\"') === -1 &&
                    text.indexOf('"type":"item"') === -1 &&
                    text.indexOf('\\"type\\":\\"item\\"') === -1 &&
                    text.indexOf('homepage_session_id') === -1) continue;

                // Use DOM identity to skip already-parsed scripts.
                if (scripts[i]._hzParsed) continue;
                scripts[i]._hzParsed = true;

                cLog('[vinted] Parsing SSR script (' + text.length + ' bytes)');
                ingestData(text);
            }

            // 2. Merge any intercepted API payloads.
            readApiData();
        }

        // Parse a text blob for "photos":[{...}] arrays from SSR text or raw API JSON.
        function parsePhotos(text, isNormalized) {
            var src = isNormalized ? text : normalizeText(text);
            var re = /"photos"\s*:\s*\[/g;
            var match;

            while ((match = re.exec(src)) !== null) {
                var arrStart = src.indexOf('[', match.index);
                if (arrStart === -1) continue;

                var arrEnd = findArrayEnd(src, arrStart);
                if (arrEnd === -1) continue;

                re.lastIndex = arrEnd + 1;

                var block = src.substring(arrStart, arrEnd + 1);
                var gallery = extractGalleryUrls(block);
                if (gallery.length === 0) continue;

                registerGalleryHashes(block, gallery);
            }
        }

        // Final fallback for non-homepage items when SSR/API data did not expose photos yet.
        function fetchItemPage(itemUrl, hash) {
            if (plug._pendingItems[itemUrl]) return;

            plug._pendingItems[itemUrl] = true;
            cLog('[vinted] Fetching item page: ' + itemUrl);

            chrome.runtime.sendMessage({
                action:'ajaxRequest',
                method:'GET',
                url:itemUrl
            }, function (response) {
                delete plug._pendingItems[itemUrl];

                if (response == null) {
                    cLog('[vinted] Item page fetch failed for ' + itemUrl);
                    cleanupItemState(itemUrl);
                    return;
                }

                ingestData(response);

                var gallery = plug._hashToGallery[hash];
                if (gallery && gallery.length > 0) {
                    cLog('[vinted] Got gallery (' + gallery.length + ' photos) from item page');
                    applyResolvedGallery(plug._activeTargets[itemUrl], gallery, !!plug._hoveredItems[itemUrl]);
                }

                cleanupItemState(itemUrl);
            });
        }
    },

    // Persistent state reused across prepareImgLinks calls.
    _hashToGallery: {},
    _pendingItems: {},
    _fetchTimers: {},
    _hoveredItems: {},
    _activeTargets: {},
    _itemIdToUserId: {},
    _wardrobeCatalogs: {},
    _wardrobeWaiters: {},
    _wardrobeRequestCallbacks: {},
    _wardrobeRequestTimeouts: {},
    _wardrobeRequestSeq: 0,
    _hookInjected: false,
    _delegateSetup: false
});
