var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Vimeo_a',
    version:'0.4',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src*="vimeo"]',
            /_\d+\./,
            '_300.'
        );

        hoverZoom.urlReplace(res,
            'img[src*="vimeo"]',
            /_\d+\./,
            '_640.'
        );

        hoverZoom.urlReplace(res,
            'img[src*="vimeo"]',
            [/_\d+x\d+.*/, /\?.*/],
            ['', '']
        );

        callback($(res), this.name);

        // videos
        // sample: https://vimeo.com/693687508
        // channels
        // sample: https://vimeo.com/channels/staffpicks/702642924?autoplay=1
        // groups
        // sample: https://vimeo.com/groups/motion/videos/712080074
        $('a[href]').filter(function() { return (/vimeo\.com\/.*?\d+/.test($(this).prop('href'))) }).on('mouseover', function() {

            var link = undefined;
            var href = undefined;

            href = this.href;
            link = $(this);

            const re = /vimeo\.com\/.*?(\d+)/;   // video id (e.g. 693687508)
            m = href.match(re);
            if (m == undefined) return;
            let videoId = m[1];

            // reuse previous result
            if (link.data().hoverZoomVimeoVideoId == videoId) {
                if (link.data().hoverZoomVimeoVideoUrl) link.data().hoverZoomSrc = [link.data().hoverZoomVimeoVideoUrl];
                return;
            }

            link.data().hoverZoomVimeoVideoId = videoId;
            link.data().hoverZoomVimeoVideoUrl = undefined;

            // clean previous result
            link.data().hoverZoomSrc = [];
            getVideoFromAPI(videoId, link);
        })

        function getVideoFromAPI(videoId, link) {

            chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:'https://player.vimeo.com/video/' + videoId + '/config',
                                        headers:[{"header":"Content-Type","value":"application/json"}]},

                                        function (response) {
                                            try {
                                                let j = JSON.parse(response);
                                                var videoUrl = undefined;
                                                // mp4
                                                if (j.request.files.progressive && j.request.files.progressive.length) {
                                                    let bestVideo = j.request.files.progressive.sort(function(a,b) { if (a.width < b.width) return 1; else return -1; })[0];
                                                    videoUrl = bestVideo.url;
                                                    if (videoUrl) {
                                                        link.data().hoverZoomVimeoVideoUrl = videoUrl;
                                                        link.data().hoverZoomSrc = [videoUrl];
                                                        callback(link, name);
                                                        hoverZoom.displayPicFromElement(link);
                                                    }
                                                }

                                                // hls
                                                if (videoUrl == undefined && j.request.files.hls) {
                                                    let values = hoverZoom.getKeysInJsonObject(j.request.files.hls, 'url', false);
                                                    if (values.length == 0) return;
                                                    let o = hoverZoom.getJsonObjectFromPath(j.request.files.hls, values[0].path.substring(0, values[0].path.lastIndexOf('[')));
                                                    videoUrl = o.url;
                                                    if (videoUrl) {
                                                        link.data().hoverZoomVimeoVideoUrl = videoUrl;
                                                        link.data().hoverZoomSrc = [videoUrl];
                                                        callback(link, name);
                                                        hoverZoom.displayPicFromElement(link);
                                                    }
                                                }
                                            } catch {}
                                        });
        }
    }
});
