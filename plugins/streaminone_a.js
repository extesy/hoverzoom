var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'streaminone_a',
    version: '1.0',
    prepareImgLinks: function(callback) {
        var name = this.name;

        // https://www.reddit.com/domain/streamin.one/
        // sample: https://streamin.one/v/bc63bf32
        // video:  mp4
        $('a[href*="streamin.one/v/"], a[href*="streamin.me/v/"]').one('mouseover', function() {
            var link = $(this);
            var href = this.href;
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            var videoId = undefined;
            let m = href.match(/\/v\/([^\/\?]{1,})/);
            if (m) {
                videoId = m[1];
            }

            if (videoId == undefined) return;

            // reuse previous result
            if (link.data().hoverZoomStreaminoneVideoId == videoId) {
                if (link.data().hoverZoomStreaminoneSrc) {
                    link.data().hoverZoomSrc = [link.data().hoverZoomStreaminoneSrc];
                    link.data().hoverZoomCaption = link.data().hoverZoomStreaminoneCaption;
                }
                return;
            }
            link.data().hoverZoomStreaminoneVideoId = videoId;
            link.data().hoverZoomStreaminoneSrc = undefined;
            link.data().hoverZoomStreaminoneCaption = undefined;

            // clean previous result
            link.data().hoverZoomSrc = [];
            link.data().hoverZoomCaption = undefined;

            // load link to extract fullsize url from document
            hoverZoom.prepareFromDocument(link, href, function(doc, callback) {
                const videoSrc = doc.head.querySelector('meta[property="og:video"]').content + '.video';
                const videoCaption = doc.head.querySelector('meta[property="og:description"]').content;

                let data = link.data();
                data.hoverZoomSrc = [videoSrc];
                data.hoverZoomCaption = videoCaption;
                data.hoverZoomStreaminoneSrc = videoSrc;
                data.hoverZoomStreaminoneCaption = videoCaption;

                callback(videoSrc);
                // video is displayed iff the cursor is still over the link
                if (data.hoverZoomMouseOver)
                    hoverZoom.displayPicFromElement(link);
                return videoSrc;
            }, true); // get source async

            // video is displayed iff the cursor is still over the link
            if (link.data().hoverZoomMouseOver)
                hoverZoom.displayPicFromElement(link);

        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

    }
});
