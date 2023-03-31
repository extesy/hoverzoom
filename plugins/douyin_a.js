var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'douyin_a',
    version: '1.0',
    prepareImgLinks: function(callback) {
        var name = this.name;

        // if header(s) rewrite is allowed store headers settings that will be used for rewrite
        if (options.allowHeadersRewrite) {
             chrome.runtime.sendMessage({action:"storeHeaderSettings",
                                        plugin:name,
                                        settings:
                                            [{"type":"request",
                                            "skipInitiator":"douyin",
                                            "url":"zjcdn.com",
                                            "headers":[{"name":"referer", "value":"https://www.douyin.com/", "typeOfUpdate":"add"}]},
                                            {"type":"response",
                                            "skipInitiator":"douyin",
                                            "url":"zjcdn.com",
                                            "headers":[{"name":"Access-Control-Allow-Origin", "value":"*", "typeOfUpdate":"add"}]}]
                                        });
        }

        function getVideoFromPage(videoHref, videoId, link) {

            hoverZoom.prepareFromDocument($(link), videoHref, function (doc, callback) {
                // search through scripts
                $(doc.querySelectorAll('script[type="application/json"]')).each(function() {
                    if (this == undefined) return true;
                    const scriptData = unescape(this.text);
                    try {
                        const j = JSON.parse(scriptData);
                        // video
                        var bestVideo = undefined;
                        var values = hoverZoom.getKeysInJsonObject(j, 'bitRateList', false);
                        if (values.length && values[0].value.length) {
                            const videos = values[0].value.sort(function(a,b) { if (a.width < b.width) return 1; if (a.width > b.width) return -1; if (a.dataSize < b.dataSize) return 1; return -1; });
                            bestVideo = videos[0].playApi + '.video';
                            bestVideo = bestVideo.replace('http:', 'https:');
                            link.data().hoverZoomDouyinVideoUrl = bestVideo;
                            link.data().hoverZoomSrc = [bestVideo];
                            callback(bestVideo);
                            hoverZoom.displayPicFromElement(link);
                            return false; // stop searching through scripts
                        }
                        // gallery
                        values = hoverZoom.getKeysInJsonObject(j, 'imgBitrate', false);
                        if (values.length && values[0].value.length) {
                            const images = values[0].value[0].images.map(i => [i.urlList[i.urlList.length - 1]])
                            link.data().hoverZoomGallerySrc = images;
                            link.data().hoverZoomDouyinGallerySrc = images;
                            callback(images);
                            hoverZoom.displayPicFromElement(link);
                            return false; // stop searching through scripts
                        }
                    } catch {}
                });
            }, true); // get source async
        }

        function getAudioVideoFromPage(videoHref, videoId, link) {

            hoverZoom.prepareFromDocument($(link), videoHref, function (doc, callback) {
                // search through scripts
                $(doc.querySelectorAll('script[type="application/json"]')).each(function() {
                    if (this == undefined) return true;
                    const scriptData = unescape(this.text);
                    try {
                        const j = JSON.parse(scriptData);
                        // video
                        var bestVideo = undefined;
                        var values = hoverZoom.getKeysInJsonObject(j, 'dynamic_video_list', false);
                        if (values.length == 0) return true;
                        const videos = values[0].value.sort(v => v.vwidth).reverse();
                        bestVideo = videos[0].main_url + '.video';
                        // audio
                        var bestAudio = undefined;
                        var values = hoverZoom.getKeysInJsonObject(j, 'dynamic_audio_list', false);
                        if (values.length) {
                            const audios = values[0].value.sort(v => v.size).reverse();
                            bestAudio = audios[0].main_url + '.audio';
                        }
                        const audioVideoUrl = (bestAudio == undefined ? bestVideo : bestVideo + '_' + bestAudio);
                        link.data().hoverZoomDouyinVideoUrl = audioVideoUrl;
                        link.data().hoverZoomSrc = [audioVideoUrl];
                        callback(audioVideoUrl);
                        hoverZoom.displayPicFromElement(link);
                        return false; // stop searching through scripts
                    } catch {}
                });
            }, true); // get source async
        }

        function getLiveFromPage(liveHref, liveId, link) {

            chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:liveHref,
                                        headers:[{"header":"Content-Type","value":"application/json"}]},
                                        function (response) {
                                            if (response == null) return;
                                            const parser = new DOMParser();
                                            const doc = parser.parseFromString(response, "text/html");
                                            // search through scripts
                                            $(doc.querySelectorAll('script[type="application/json"]')).each(function() {
                                                if (this == undefined) return true;
                                                const scriptData = unescape(this.text);
                                                try {
                                                    const j = JSON.parse(scriptData);
                                                    const values = hoverZoom.getKeysInJsonObject(j, 'hls_pull_url', false);
                                                    if (values.length == 0) return true;
                                                    const value = values.filter(v => v.path.indexOf('["roomInfo"]["room"]') != -1);
                                                    if (value.length == 0) return true;
                                                    const m3u8 = value[0].value.replace('http:', 'https:');
                                                    link.data().hoverZoomDouyinLiveUrl = m3u8;
                                                    link.data().hoverZoomSrc = [m3u8];
                                                    callback(link, this.name);
                                                    hoverZoom.displayPicFromElement(link);
                                                    return false; // stop searching through scripts
                                                } catch {}
                                            });
                                        });
        }

        // videos
        // https://www.douyin.com/video/7214731107336457509
        $('a[href*="/video/"]').filter(function() { return (/douyin.com\/video\/\d+/.test($(this).prop('href'))) }).on('mouseover', function() {

            const href = this.href;
            const link = $(this);

            console.log('href=' + href);

            const re1 = /douyin.com\/video\/(\d+)/;   // video id (e.g. 7214731107336457509)
            const m = href.match(re1);
            if (m == undefined) return;
            const videoId = m[1];
            console.log('videoId=' + videoId);

            // reuse previous result
            if (link.data().hoverZoomDouyinVideoId == videoId) {
                if (link.data().hoverZoomDouyinVideoUrl) link.data().hoverZoomSrc = [link.data().hoverZoomDouyinVideoUrl];
                return;
            }

            link.data().hoverZoomDouyinVideoId = videoId;
            link.data().hoverZoomDouyinVideoUrl = undefined;

            // clean previous result
            link.data().hoverZoomSrc = [];
            getVideoFromPage(href, videoId, link);
        })

        // lvdetail
        // https://www.douyin.com/lvdetail/7184703931178549819
        $('a[href*="/lvdetail/"]').filter(function() { return (/douyin.com\/lvdetail\/\d+/.test($(this).prop('href'))) }).on('mouseover', function() {

            const href = this.href;
            const link = $(this);

            console.log('href=' + href);

            const re1 = /douyin.com\/lvdetail\/(\d+)/;   // video id (e.g. 7184703931178549819)
            const m = href.match(re1);
            if (m == undefined) return;
            const videoId = m[1];
            console.log('videoId=' + videoId);

            // reuse previous result
            if (link.data().hoverZoomDouyinVideoId == videoId) {
                if (link.data().hoverZoomDouyinVideoUrl) link.data().hoverZoomSrc = [link.data().hoverZoomDouyinVideoUrl];
                return;
            }

            link.data().hoverZoomDouyinVideoId = videoId;
            link.data().hoverZoomDouyinVideoUrl = undefined;

            // clean previous result
            link.data().hoverZoomSrc = [];
            getAudioVideoFromPage(href, videoId, link);
        })

        // live
        // https://live.douyin.com/224043262556
        $('a[href*="live.douyin.com"]').filter(function() { return (/live.douyin.com\/\d+/.test($(this).prop('href'))) }).on('mouseover', function() {

            const href = this.href;
            const link = $(this);

            console.log('href=' + href);

            const re1 = /live.douyin.com\/(\d+)/;   // live id (e.g. 224043262556)
            const m = href.match(re1);
            if (m == undefined) return;
            const liveId = m[1];
            console.log('liveId=' + liveId);

            // reuse previous result
            if (link.data().hoverZoomDouyinLiveId == liveId) {
                if (link.data().hoverZoomDouyinLiveUrl) link.data().hoverZoomSrc = [link.data().hoverZoomDouyinLiveUrl];
                return;
            }

            link.data().hoverZoomDouyinLiveId = liveId;
            link.data().hoverZoomDouyinLiveUrl = undefined;

            // clean previous result
            link.data().hoverZoomSrc = [];
            getLiveFromPage(href, liveId, link);
        })
    }
});
