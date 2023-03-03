var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'omegle_a',
    version:'0.1',
    prepareImgLinks:function (callback) {

        // page with samples: https://www.reddit.com/r/omeglechatlogs/
        // link:              http://logs.omegle.com/f92d7acec5c23f52
        // fullsize:          http://l.omegle.com.s3.amazonaws.com/f92d7acec5c23f52.png?Signature=BLO7M29JGBHzGngGTP84SHZplXc%3D&Expires=1662225209&AWSAccessKeyId=0HRF7PBJAVZTZENY15G2
        $('a[href*="logs.omegle.com"]:not(.hoverZoomMouseover), a[href*="logs.Omegle.com"]:not(.hoverZoomMouseover)').addClass('hoverZoomMouseover').one('mouseover', function() {

            href = this.href;
            link = $(this);

            chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method: 'GET',
                                        url: href},
                                        function (response) {
                                            const parser = new DOMParser();
                                            const html = parser.parseFromString(response, "text/html");
                                            const meta = html.querySelector('meta[property="og:image"]');
                                            if (meta) {
                                                let fullsizeUrl = meta.content;
                                                if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                                                if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                                                    link.data().hoverZoomSrc.unshift(fullsizeUrl);
                                                }
                                                callback(link, this.name);
                                                hoverZoom.displayPicFromElement(link);
                                            }
                                        });
        });
    }
});
