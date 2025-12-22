var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'Pinterest',
    version: '0.4',
    prepareImgLinks: function (callback) {

        var pluginName = this.name;
        var res = [];

        //$('div[data-test-id="pinWrapper"]').one('mouseover', function() {
        $('a:not([href*="/pin/"])').one('mouseover', function() {
            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            var img = link.find('img[srcset]');
            if (img.length === 1 || img.length === 2) {
                var srcset = img.attr('srcset').split(" ");
                link.data().hoverZoomSrc = [srcset[srcset.length - 2]];
                link.data().hoverZoomCaption = img.attr('alt');
                link.addClass('hoverZoomLink');
            }
        }).one('mouseleave', function() {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

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

        // imgs without srcset
        patches.forEach(patch => {
            hoverZoom.urlReplace(res,
            'img[src]:not([srcset])',
            /\/\d+x(\d+)?\//,
            patch
            );
        });

        // background imgs
        $('[style*=url]').each(function() {
            let link = $(this);
            // extract url from style
            let backgroundImage = this.style.backgroundImage;
            if (backgroundImage.indexOf("url") == -1) return;

            let reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            // remove leading & trailing quotes
            let backgroundImageUrl = backgroundImage.replace(/^['"]/, "").replace(/['"]+$/, "");

            patches.forEach(patch => {

                let fullsizeUrl = backgroundImageUrl.replace(/\/\d+x(\d+)?\//, patch);
                if (fullsizeUrl != backgroundImageUrl) {

                    if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                    if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                        link.data().hoverZoomSrc.unshift(fullsizeUrl);
                        res.push(link);
                    }
                }
            });
        });

        // links to images and videos
        // sample: https://fr.pinterest.com/pin/877427939880031610/
        // pin:    877427939880031610
        // sample: https://fr.pinterest.com/pin/Ac5MASQywei3ijdxsTiDRdgBe1skBCgTSBBbYumTvofSKDUrdj6Zl85OBOD_GcZnCl2tixq83MlHUtwTYzfnJjw/
        // pin:    Ac5MASQywei3ijdxsTiDRdgBe1skBCgTSBBbYumTvofSKDUrdj6Zl85OBOD_GcZnCl2tixq83MlHUtwTYzfnJjw
        $('a[href*="/pin/"]').one('mouseover', function() {
            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            const href = this.href;
            const re = /\/pin\/([^\/]{1,})/
            const m = href.match(re);
            if (m == undefined) return;
            const pin = m[1];

            // resuse previous result
            if (link.data().hoverZoomPin == pin) {
                link.data().hoverZoomSrc = [link.data().hoverZoomPinUrl];
                link.data().hoverZoomCaption = link.data().hoverZoomPinCaption;
                return;
            }

            chrome.runtime.sendMessage({action:'ajaxGet', url:href}, function (response) {

                if (response == null) { return; }

                const parser = new DOMParser();
                const doc = parser.parseFromString(response, "text/html");

                if (doc.scripts == undefined) return;
                let scripts = Array.from(doc.scripts);
                scripts = scripts.filter(script => script.id === "__PWS_INITIAL_PROPS__");
                if (scripts.length != 1) return;
                const jObj = JSON.parse(scripts[0].text);
                const pinData = jObj.initialReduxState.pins[pin];
                if (!pinData) return;
                const videos = pinData.videos;
                const images = pinData.images;
                const story_pin_data = pinData.story_pin_data;
                const caption = pinData.rich_metadata?.title || pinData.title || pinData.seo_title;
                let video_list = undefined;
                let src = undefined;

                if (videos) {
                    video_list = videos.video_list;
                } else if (story_pin_data) {
                    video_list = story_pin_data?.pages[0]?.video?.video_list;
                    if (video_list == undefined) {
                        //check blocks
                        video_list = story_pin_data?.pages[0]?.blocks[0]?.video?.video_list;
                    }
                }

                if (video_list) {
                    // MP4 or HLS format
                    src = video_list?.V_720P?.url || video_list?.V_EXP7?.url || video_list?.V_EXP6?.url || video_list?.V_EXP5?.url || video_list?.V_EXP4?.url || video_list?.V_EXP3?.url || video_list?.V_HLSV4?.url || video_list?.V_HLSV3_MOBILE?.url;
                }

                if (src === undefined) {
                    src = images?.orig?.url;
                }

                if (!src) return;

                link.data().hoverZoomSrc = [src];
                link.data().hoverZoomCaption = caption;
                link.data().hoverZoomPin = pin;
                link.data().hoverZoomPinUrl = src;
                link.data().hoverZoomPinCaption = caption;

                res = [link];
                callback($(res), pluginName);
                // Image/video is displayed iff cursor is still over the image/video
                if (link.data().hoverZoomMouseOver)
                    hoverZoom.displayPicFromElement(link);
            });
        }).one('mouseleave', function() {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        callback($(res), this.name);
    }
});
