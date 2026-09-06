var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'Pinterest',
    version: '0.5',
    prepareImgLinks: function (callback) {

        var pluginName = this.name;
        var res = [];
        var patches = [ '/280x280/', '/736x/', '/originals/' ];

        // avatars
        // samples (order by size ascending)
        // https://i.pinimg.com/30x30_RS/2b/9b/ab/2b9bab890b9b5fbbb86658dd2f7dcca7.jpg
        // https://i.pinimg.com/75x75_RS/2b/9b/ab/2b9bab890b9b5fbbb86658dd2f7dcca7.jpg
        // https://i.pinimg.com/140x140_RS/2b/9b/ab/2b9bab890b9b5fbbb86658dd2f7dcca7.jpg
        // https://i.pinimg.com/280x280_RS/2b/9b/ab/2b9bab890b9b5fbbb86658dd2f7dcca7.jpg
        // https://i.pinimg.com/736x/2b/9b/ab/2b9bab890b9b5fbbb86658dd2f7dcca7.jpg
        // https://i.pinimg.com/originals/2b/9b/ab/2b9bab890b9b5fbbb86658dd2f7dcca7.jpg
        patches.forEach(patch => {
            hoverZoom.urlReplace(res,
                'img[src]',
                /\/\d+x\d+_RS\//,
                patch
            );
        });

        // pin images (with or without srcset)
        patches.forEach(patch => {
            hoverZoom.urlReplace(res,
                'img[src]',
                /\/\d+x(\d+)?\//,
                patch,
                ['a[href*="/pin/"]', 'div[data-test-id="pinWrapper"]', 'a', '']
            );
        });

        // imgs with srcset that might not have src
        $('img[srcset]').each(function () {
            let img = $(this);
            let link = img.parents('a[href*="/pin/"]');
            if (!link.length) link = img.parents('div[data-test-id="pinWrapper"]');
            if (!link.length) link = img.parents('a');
            if (!link.length) link = img;

            if (link.data().hoverZoomSrc && link.data().hoverZoomSrc.length) return;

            let biggestSrc = hoverZoom.getBiggestSrcFromSrcset(this.getAttribute('srcset'));
            if (!biggestSrc) return;

            let orig = biggestSrc.replace(/\/\d+x(\d+)?\//, '/originals/');
            let high = biggestSrc.replace(/\/\d+x(\d+)?\//, '/736x/');
            let srcs = [];
            if (orig && orig !== biggestSrc) srcs.push(orig);
            if (high && high !== orig) srcs.push(high);
            srcs.push(biggestSrc);

            link.data().hoverZoomSrc = srcs;
            res.push(link);
        });

        // background imgs
        $('[style*=url]').each(function() {
            let link = $(this);
            // extract url from style
            let backgroundImage = this.style.backgroundImage;
            if (backgroundImage.indexOf("url") == -1) return;

            let reUrl = /.*url\s*\(\s*(.*)\s*\).*/i;
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            // remove leading & trailing quotes
            let backgroundImageUrl = backgroundImage.replace(/^['"]/, "").replace(/['"]+$/, "");

            patches.forEach(patch => {
                let fullsizeUrl = backgroundImageUrl.replace(/\/\d+x(\d+)?\//, patch);
                if (fullsizeUrl != backgroundImageUrl) {
                    if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = []; }
                    if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                        link.data().hoverZoomSrc.unshift(fullsizeUrl);
                        res.push(link);
                    }
                }
            });
        });

        // video pins and metadata enrichment
        // sample: https://fr.pinterest.com/pin/877427939880031610/
        // sample: https://fr.pinterest.com/pin/Ac5MASQywei3ijdxsTiDRdgBe1skBCgTSBBbYumTvofSKDUrdj6Zl85OBOD_GcZnCl2tixq83MlHUtwTYzfnJjw/
        $('a[href*="/pin/"]').on('mouseenter', function() {
            const link = $(this);
            const href = this.href;
            const re = /\/pin\/([^\/]{1,})/;
            const m = href.match(re);
            if (!m) return;
            const pin = m[1];

            // reuse previous video result
            if (link.data().hoverZoomPin == pin) {
                if (link.data().hoverZoomPinVideoUrl) {
                    link.data().hoverZoomSrc = [link.data().hoverZoomPinVideoUrl];
                    if (link.data().hoverZoomPinCaption) link.data().hoverZoomCaption = link.data().hoverZoomPinCaption;
                    hoverZoom.displayPicFromElement(link, true);
                }
                return;
            }

            if (link.data().hoverZoomPinLoading) return;
            link.data().hoverZoomPinLoading = true;

            // Check if there is already a <video> element inside the link or wrapper
            const videoEl = link.find('video')[0] || link.closest('div[data-test-id="pinWrapper"]').find('video')[0];
            if (videoEl) {
                const videoSrc = videoEl.currentSrc || videoEl.src || $(videoEl).find('source').attr('src');
                if (videoSrc) {
                    link.data().hoverZoomPinLoading = false;
                    link.data().hoverZoomPin = pin;
                    link.data().hoverZoomPinVideoUrl = videoSrc;
                    link.data().hoverZoomSrc = [videoSrc];
                    callback($(link), pluginName);
                    if (link.is(':hover') || link.find(':hover').length > 0) {
                        hoverZoom.displayPicFromElement(link, true);
                    }
                    return;
                }
            }

            // Check if pinData exists in current document's __PWS_INITIAL_PROPS__ / __PWS_DATA__
            let pinData = null;
            const docScript = document.getElementById('__PWS_INITIAL_PROPS__') || document.getElementById('__PWS_DATA__');
            if (docScript) {
                try {
                    const jObj = JSON.parse(docScript.text);
                    pinData = jObj?.initialReduxState?.pins?.[pin];
                } catch (e) {}
            }

            function processPinData(data) {
                link.data().hoverZoomPinLoading = false;
                link.data().hoverZoomPin = pin;
                if (!data) return;

                const videos = data.videos;
                const story_pin_data = data.story_pin_data;
                const caption = data.rich_metadata?.title || data.title || data.seo_title;
                let video_list = undefined;
                let src = undefined;

                if (videos) {
                    video_list = videos.video_list;
                } else if (story_pin_data) {
                    video_list = story_pin_data?.pages?.[0]?.video?.video_list;
                    if (video_list == undefined) {
                        video_list = story_pin_data?.pages?.[0]?.blocks?.[0]?.video?.video_list;
                    }
                }

                if (video_list) {
                    // MP4 or HLS format
                    src = video_list?.V_720P?.url || video_list?.V_EXP7?.url || video_list?.V_EXP6?.url || video_list?.V_EXP5?.url || video_list?.V_EXP4?.url || video_list?.V_EXP3?.url || video_list?.V_HLSV4?.url || video_list?.V_HLSV3_MOBILE?.url;
                }

                if (src) {
                    link.data().hoverZoomPinVideoUrl = src;
                    link.data().hoverZoomSrc = [src];
                    if (caption) {
                        link.data().hoverZoomCaption = caption;
                        link.data().hoverZoomPinCaption = caption;
                    }
                    callback($(link), pluginName);
                    if (link.is(':hover') || link.find(':hover').length > 0) {
                        hoverZoom.displayPicFromElement(link, true);
                    }
                } else if (caption && !link.data().hoverZoomCaption) {
                    link.data().hoverZoomCaption = caption;
                }
            }

            if (pinData) {
                processPinData(pinData);
                return;
            }

            // Only fetch via ajax if the pin might be a video (has video badge, video test id, duration, or video icon)
            // or if we have no high-res image yet.
            const hasVideoIndicator = link.find('video, [data-test-id*="video"], [aria-label*="video" i], [aria-label*="Video"]').length > 0 ||
                link.closest('div[data-test-id="pinWrapper"]').find('video, [data-test-id*="video"], [aria-label*="video" i], [aria-label*="Video"]').length > 0;

            if (!hasVideoIndicator && link.data().hoverZoomSrc && link.data().hoverZoomSrc.length > 0) {
                link.data().hoverZoomPinLoading = false;
                link.data().hoverZoomPin = pin;
                return;
            }

            chrome.runtime.sendMessage({action: 'ajaxGet', url: href}, function (response) {
                if (!response) {
                    link.data().hoverZoomPinLoading = false;
                    return;
                }
                try {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response, "text/html");
                    if (!doc.scripts) {
                        link.data().hoverZoomPinLoading = false;
                        return;
                    }
                    const script = Array.from(doc.scripts).find(s => s.id === '__PWS_INITIAL_PROPS__' || s.id === '__PWS_DATA__');
                    if (!script) {
                        link.data().hoverZoomPinLoading = false;
                        return;
                    }
                    const jObj = JSON.parse(script.text);
                    const fetchedPinData = jObj?.initialReduxState?.pins?.[pin];
                    processPinData(fetchedPinData);
                } catch (e) {
                    link.data().hoverZoomPinLoading = false;
                }
            });
        });

        callback($(res), this.name);
    }
});
