var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'Instagram',
    version: '0.8',
    favicon: 'instagram.svg',
    prepareImgLinks: function (callback) {
        const pluginName = this.name;
        var res = [];

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

        function getBestVideoUrl(videoVersions, videoUrl) {
            if (Array.isArray(videoVersions) && videoVersions.length) {
                var sorted = videoVersions.slice().sort(function (a, b) {
                    return (b.width * (b.height || b.width)) - (a.width * (a.height || a.width));
                });
                return sorted[0].url;
            }
            return videoUrl || null;
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
                    var vUrl = getBestVideoUrl(item.video_versions, item.video_url);
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

            var videoUrl = getBestVideoUrl(node.video_versions, node.video_url);
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

        function processMediaObject(node, map) {
            if (!node || typeof node !== 'object') return;

            var shortcode = node.shortcode || node.code;
            var id = node.id || node.pk;

            var hasMedia = node.carousel_media || node.edge_sidecar_to_children ||
                           node.image_versions2 || node.display_url || node.display_resources ||
                           node.video_versions || node.video_url;

            if (hasMedia && (shortcode || id)) {
                var postData = parseMediaNode(node);
                if (postData) {
                    if (shortcode) map[shortcode] = postData;
                    if (id) {
                        var cleanId = String(id).split('_')[0];
                        map[cleanId] = postData;
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

        var mediaMap = {};
        try {
            var stored = sessionStorage.getItem('hzInstagramMedia');
            if (stored) mediaMap = JSON.parse(stored);
        } catch (e) {}

        // Scan any SSR JSON scripts already present in the document
        $('script[type="application/json"]').each(function () {
            try {
                var j = JSON.parse(this.textContent);
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

            hookScript.text = `(${function () {
                if (window.__hzInstagramHooked) return;
                window.__hzInstagramHooked = true;

                var hookMediaMap = {};
                try {
                    var st = sessionStorage.getItem('hzInstagramMedia');
                    if (st) hookMediaMap = JSON.parse(st);
                } catch (e) {}

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

                function getBestVideoUrl(videoVersions, videoUrl) {
                    if (Array.isArray(videoVersions) && videoVersions.length) {
                        var sorted = videoVersions.slice().sort(function (a, b) {
                            return (b.width * (b.height || b.width)) - (a.width * (a.height || a.width));
                        });
                        return sorted[0].url;
                    }
                    return videoUrl || null;
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
                            var vUrl = getBestVideoUrl(item.video_versions, item.video_url);
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

                    var videoUrl = getBestVideoUrl(node.video_versions, node.video_url);
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

                function processMediaObject(node, map) {
                    if (!node || typeof node !== 'object') return;

                    var shortcode = node.shortcode || node.code;
                    var id = node.id || node.pk;

                    var hasMedia = node.carousel_media || node.edge_sidecar_to_children ||
                                   node.image_versions2 || node.display_url || node.display_resources ||
                                   node.video_versions || node.video_url;

                    if (hasMedia && (shortcode || id)) {
                        var postData = parseMediaNode(node);
                        if (postData) {
                            if (shortcode) map[shortcode] = postData;
                            if (id) {
                                var cleanId = String(id).split('_')[0];
                                map[cleanId] = postData;
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
                                if (text && (text.indexOf('image_versions2') !== -1 || text.indexOf('display_url') !== -1 || text.indexOf('carousel_media') !== -1 || text.indexOf('video_versions') !== -1)) {
                                    processIncoming(JSON.parse(text));
                                }
                            } catch (e) {}
                        });
                        return origOpen.apply(this, arguments);
                    };
                }

                document.addEventListener('hzInstagramFetchRequest', function (e) {
                    try {
                        var req = JSON.parse(e.detail);
                        if (!req || !req.shortcode) return;
                        if (hookMediaMap[req.shortcode]) {
                            notifyMedia();
                            return;
                        }
                        var url = '/p/' + req.shortcode + '/?__a=1&__d=dis';
                        window.fetch(url, {
                            headers: {
                                'X-IG-App-ID': '936619743392459',
                                'X-Requested-With': 'XMLHttpRequest'
                            }
                        }).then(function (r) { return r.json(); }).then(function (data) {
                            processIncoming(data);
                        }).catch(function () {
                            if (req.mediaId) {
                                window.fetch('/api/v1/media/' + req.mediaId + '/info/', {
                                    headers: { 'X-IG-App-ID': '936619743392459' }
                                }).then(function (r) { return r.json(); }).then(function (data) {
                                    processIncoming(data);
                                }).catch(function () {});
                            }
                        });
                    } catch (err) {}
                });

                if (Object.keys(hookMediaMap).length > 0) {
                    notifyMedia();
                }
            }.toString()})();`;

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
                        if (sc && mediaMap[sc]) {
                            applyMediaToElement(el, mediaMap[sc]);
                            hoverZoom.displayPicFromElement(el);
                        }
                    }
                });
            } catch (err) {}
        });

        function applyMediaToElement(el, postData) {
            if (!postData) return;
            if (postData.type === 'carousel' && postData.gallery && postData.gallery.length > 0) {
                el.data().hoverZoomGallerySrc = postData.gallery;
                el.data().hoverZoomGalleryIndex = 0;
                el.data().hoverZoomGalleryCaption = postData.captions;
                el.data().hoverZoomSrc = postData.gallery[0];
                el.data().hoverZoomCaption = postData.captions ? postData.captions[0] : (postData.caption || '');
            } else if (postData.type === 'video' && postData.url) {
                el.data().hoverZoomSrc = [postData.url];
                el.data().hoverZoomCaption = postData.caption || '';
                el.data().hoverZoomGallerySrc = undefined;
            } else if (postData.url) {
                el.data().hoverZoomSrc = [postData.url];
                el.data().hoverZoomCaption = postData.caption || '';
                el.data().hoverZoomGallerySrc = undefined;
            }
        }

        function requestPostData(shortcode) {
            if (!shortcode) return;
            var mediaId = mediaIdfromShortcode(shortcode);
            document.dispatchEvent(new CustomEvent('hzInstagramFetchRequest', {
                detail: JSON.stringify({ shortcode: shortcode, mediaId: mediaId })
            }));
        }

        // Helper to bind mouseover / mouseleave on target
        function bindHover(el, shortcode) {
            if (el.data().hoverZoomBound) return;
            el.data().hoverZoomBound = true;
            if (shortcode) el.data().hoverZoomShortcode = shortcode;

            el.on('mouseover', function () {
                var link = $(this);
                link.data().hoverZoomMouseOver = true;
                var sc = link.data().hoverZoomShortcode;
                if (sc) {
                    if (mediaMap[sc]) {
                        applyMediaToElement(link, mediaMap[sc]);
                    } else {
                        requestPostData(sc);
                    }
                }
            }).on('mouseleave', function () {
                $(this).data().hoverZoomMouseOver = false;
            });
        }

        // 1. Feed posts (<article>)
        $('article').each(function () {
            var article = $(this);
            var postLink = article.find('a[href*="/p/"], a[href*="/reel/"]').first();
            var shortcode = null;
            if (postLink.length) {
                var m = postLink.attr('href').match(/\/(p|reel)\/([^/?#]+)/);
                if (m) shortcode = m[2];
            }

            // Media in feed: photos or carousel
            var images = article.find('img[src*="cdninstagram.com"], img[src*="fbcdn.net"], img[srcset]').filter(function () {
                return $(this).closest('header').length === 0;
            });

            images.each(function () {
                var img = $(this);
                var target = img.closest('div[role="button"], div:has(> img)');
                if (!target.length) target = img;

                bindHover(target, shortcode);
                bindHover(img, shortcode);

                if (shortcode && mediaMap[shortcode]) {
                    applyMediaToElement(target, mediaMap[shortcode]);
                    applyMediaToElement(img, mediaMap[shortcode]);
                } else {
                    // Check for multiple slides in DOM
                    var slides = [];
                    var captions = [];
                    article.find('ul li img, div[role="presentation"] img').each(function () {
                        var sBest = getBestFromSrcset($(this).attr('srcset')) || this.src;
                        if (sBest && !slides.some(function (s) { return s[0] === (sBest + '#hz'); })) {
                            slides.push([sBest + '#hz']);
                            captions.push($(this).attr('alt') || '');
                        }
                    });

                    if (slides.length > 1) {
                        target.data().hoverZoomGallerySrc = slides;
                        target.data().hoverZoomGalleryIndex = 0;
                        target.data().hoverZoomGalleryCaption = captions;
                        target.data().hoverZoomSrc = slides[0];
                        target.data().hoverZoomCaption = captions[0] || '';

                        img.data().hoverZoomGallerySrc = slides;
                        img.data().hoverZoomGalleryIndex = 0;
                        img.data().hoverZoomGalleryCaption = captions;
                        img.data().hoverZoomSrc = slides[0];
                        img.data().hoverZoomCaption = captions[0] || '';
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

            // Video in feed
            article.find('video').each(function () {
                var video = this;
                var url = video.currentSrc || video.src;
                if (!url || !/^https?:/.test(url)) return;
                var vTarget = $(video);
                bindHover(vTarget, shortcode);
                if (shortcode && mediaMap[shortcode] && mediaMap[shortcode].url) {
                    vTarget.data().hoverZoomSrc = [mediaMap[shortcode].url];
                } else {
                    vTarget.data().hoverZoomSrc = [url + '.video'];
                }
                res.push(vTarget[0]);
            });
        });

        // 2. Post links (profile grid, explore, individual post pages)
        $('a[href*="/p/"], a[href*="/reel/"]').each(function () {
            var link = $(this);
            var m = link.prop('href').match(/\/(p|reel)\/([^/?#]+)/);
            if (!m) return;
            var shortcode = m[2];

            bindHover(link, shortcode);

            var img = link.find('img').first();
            if (shortcode && mediaMap[shortcode]) {
                applyMediaToElement(link, mediaMap[shortcode]);
            } else if (img.length) {
                var bestUrl = getBestFromSrcset(img.attr('srcset')) || img.attr('src');
                if (bestUrl) {
                    link.data().hoverZoomSrc = [bestUrl + '#hz'];
                    link.data().hoverZoomCaption = img.attr('alt') || link.attr('aria-label') || '';
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

        // 5. Header reels & highlights (stories)

        $('div[role="button"] img:not(div[role="presentation"] img)').on('mouseover', function () {
            if (document.location.href.match('(following|followers)')) return;
            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            if (link.data().hoverZoomInstagramGallerySrc) {
                link.data().hoverZoomGallerySrc = link.data().hoverZoomInstagramGallerySrc;
                link.data().hoverZoomGalleryCaption = link.data().hoverZoomInstagramGalleryCaption;
                return;
            }

            var bestUrl = getBestFromSrcset(link.attr('srcset')) || link.attr('src');
            if (bestUrl) {
                link.data().hoverZoomSrc = [bestUrl + '#hz'];
            }
        }).on('mouseleave', function () {
            $(this).data().hoverZoomMouseOver = false;
        });

        callback($(res), pluginName);
    }
});
