var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'mubi',
    version:'0.1',
    prepareImgLinks:function (callback) {

        // images
        // thumbnail: https://images.mubicdn.net/images/film/153477/cache-133654-1567584049/image-w1280.jpg?size=400x
        //  fullsize: https://images.mubicdn.net/images/film/153477/cache-133654-1567584049/image-original.jpg
        $('img[src*="mubicdn.net"], a img[src*="mubicdn.net"], article img[src*="mubicdn.net"]').one('mouseenter', function () {

            const src = this.src || this.imgurl;
            const link = $(this);

            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            updateLink(link, src);

            var res = [];
            res.push(link);
            callback($(res), 'mubi');
            // Image is displayed if the cursor is still over the link
            if (link.data().hoverZoomMouseOver)
                hoverZoom.displayPicFromElement(link);
        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // background images
        $('[style*=url]').one('mouseenter', function () {

            let link = $(this);

            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            let styleBackground = this.style.backgroundImage;
            const src = findBackgroundImgUrl(styleBackground);

            if (src == undefined) return;
            updateLink(link, src);

            var res = [];
            res.push(link);
            callback($(res), 'mubi');
            // Image is displayed if the cursor is still over the link
            if (link.data().hoverZoomMouseOver)
                hoverZoom.displayPicFromElement(link);
        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // images & videos
        $('a[href]').filter(function() { return /mubi.com/.test($(this).prop('href')) }).one('mouseenter', function () {

            const href = this.href;
            const link = $(this);

            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;
            cLog(`href: ${href}`);

            // image url not found in storageSession => load page to extract image url
            chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:href,
                                        headers:[{"header":"Content-Type","value":"application/json"}]},

                                        function (response) {
                                            cLog(response);

                                            const parser = new DOMParser();
                                            const doc = parser.parseFromString(response, "text/html");
                                            const video = doc.head.querySelector('meta[property="og:video"]');
                                            if (video) {
                                                link.data().hoverZoomSrc = [video.content];
                                            } else {
                                                // no video found so try to zoom image
                                                var src = undefined;
                                                // find img below link
                                                if (link.find('img[src]').length == 1) {
                                                    src = link.find('img[src]')[0].src;
                                                }
                                                if (src == undefined) {
                                                    // find img in siblings
                                                    if (link.parent('div').siblings('div').find('img').length == 1) {
                                                        src = link.parent('div').siblings('div').find('img')[0].src;
                                                    }
                                                }
                                                if (src == undefined) {
                                                    // check background
                                                    if (link.parent('div').length == 1) {
                                                        let styleBackground = getComputedStyle(link.parent('div')[0]).background;
                                                        src = findBackgroundImgUrl(styleBackground);
                                                    }
                                                }

                                                if (src == undefined) return;
                                                updateLink(link, src);
                                            }
                                            var res = [];
                                            res.push(link);
                                            callback($(res), 'mubi');
                                            // Image is displayed if the cursor is still over the link
                                            if (link.data().hoverZoomMouseOver)
                                                hoverZoom.displayPicFromElement(link);
                                        });

        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // extract image url from style
        function findBackgroundImgUrl(styleBackground) {
            const reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            let url = styleBackground.replace(reUrl, '$1');
            if (url == styleBackground) return undefined;
            // remove leading & trailing quotes
            return url.replace(/^['"]/, "").replace(/['"]+$/, "");
        }

        // add fullsize urls to link dataset
        function updateLink(link, src) {
            cLog(`src: ${src}`);
            const re = /(^.*)\/(images?)-(.*?)\.(jpe?g|png|gif)(.*)/
            var fullsize1 = src.replace(re, '$1/$2-original.$4').replace('assets.', 'images.');
            var fullsize2 = src.replace(re, '$1/$2-w1280.$4').replace('assets.', 'images.');
            var fullsize3 = src.replace(re, '$1/$2-$3.$4').replace('assets.', 'images.');
            link.data().hoverZoomSrc = [];
            if (src != fullsize1) link.data().hoverZoomSrc.push(fullsize1);
            if (src != fullsize2) link.data().hoverZoomSrc.push(fullsize2);
            if (src != fullsize3) link.data().hoverZoomSrc.push(fullsize3);
        }

    }
});