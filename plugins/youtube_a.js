var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'youtube_a',
    version: '2.2',

    prepareImgLinks:function (callback) {
        const name = this.name;
        var res = [];

        let INNERTUBE_API_URL = "https://www.youtube.com/youtubei/v1/player?key=";
        let INNERTUBE_CLIENT_VERSION = "2.20211221.00.00";
        let INNERTUBE_CLIENT_NAME = "WEB";
        let INNERTUBE_API_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";

        const tok_INNERTUBE_CLIENT_VERSION = "INNERTUBE_CLIENT_VERSION";
        const tok_INNERTUBE_CLIENT_NAME = "INNERTUBE_CLIENT_NAME";
        const tok_INNERTUBE_API_KEY = "INNERTUBE_API_KEY";

        let innerHtml = document.documentElement.innerHTML;
        let pos_INNERTUBE_CLIENT_VERSION = innerHtml.indexOf(tok_INNERTUBE_CLIENT_VERSION);
        if (pos_INNERTUBE_CLIENT_VERSION > -1) {
            let firstquoteIndex = pos_INNERTUBE_CLIENT_VERSION + tok_INNERTUBE_CLIENT_VERSION.length + 2;
            let lastquoteIndex = innerHtml.indexOf('"', firstquoteIndex + 1);
            INNERTUBE_CLIENT_VERSION = innerHtml.substring(firstquoteIndex + 1, lastquoteIndex);
        }
        let pos_INNERTUBE_CLIENT_NAME = innerHtml.indexOf(tok_INNERTUBE_CLIENT_NAME);
        if (pos_INNERTUBE_CLIENT_NAME > -1) {
            let firstquoteIndex = pos_INNERTUBE_CLIENT_NAME + tok_INNERTUBE_CLIENT_NAME.length + 2;
            let lastquoteIndex = innerHtml.indexOf('"', firstquoteIndex + 1);
            INNERTUBE_CLIENT_NAME = innerHtml.substring(firstquoteIndex + 1, lastquoteIndex);
        }
        let pos_INNERTUBE_API_KEY = innerHtml.indexOf(tok_INNERTUBE_API_KEY);
        if (pos_INNERTUBE_API_KEY > -1) {
            let firstquoteIndex = pos_INNERTUBE_API_KEY + tok_INNERTUBE_API_KEY.length + 2;
            let lastquoteIndex = innerHtml.indexOf('"', firstquoteIndex + 1);
            INNERTUBE_API_KEY = innerHtml.substring(firstquoteIndex + 1, lastquoteIndex);
        }

        // if header(s) rewrite is allowed store headers settings that will be used for rewrite
        if (options.allowHeadersRewrite) {
            chrome.runtime.sendMessage({
                action: "storeHeaderSettings",
                plugin: name,
                settings:
                    [{
                        "type": "request",
                        "skipInitiator": "youtube",
                        "url": "youtube.com/youtubei/v1/player?key=",
                        "headers": [{"name": "origin", "value": "https://music.youtube.com", "typeOfUpdate": "add"}]
                    },
                    {
                        "type": "response",
                        "skipInitiator": "youtube",
                        "url": "youtube.com/youtubei/v1/player?key=",
                        "headers": [{"name": "Access-Control-Allow-Origin", "value": "*", "typeOfUpdate": "add"}]
                    },
                    {
                        "type": "response",
                        "skipInitiator": "",
                        "url": "googlevideo.com/videoplayback/id/",
                        "headers": [{"name": "Access-Control-Allow-Origin", "value": "*", "typeOfUpdate": "add"}]
                    }]
            });
        }

        $('a[href*="/watch?v="], a[href*="/shorts/"], a[href*="youtu.be"], div[ourl*="/watch?v="], div[ourl*="/shorts/"], div[ourl*="youtu.be"]').on('mouseover', function() {
            let link = $(this), href;

            if (link.is('a')) {
                href = this.href;
            } else if (link.is('div')) {
                href = link.attr('ourl'); // Bing
            }
            if (!href)
                return;
            cLog(`href: ${href}`);

            const re1 = /\/watch\?v=([^&]{1,})/;   // sample: https://www.youtube.com/watch?v=NaOiA15Rz5k
            const re2 = /\/youtu.be\/([^?&]{1,})/;  // sample: https://youtu.be/qXlQbj0PgDo https://youtu.be/qORYO0atB6g?t=28
            const re3 = /\/shorts\/([^?&]{1,})/;   // sample: https://www.youtube.com/shorts/gmkUDjwRX98
            let m = href.match(re1);
            if (!m)
                m = href.match(re2);
             if (!m)
                m = href.match(re3);
            if (!m)
                return;
            const videoId = m[1];
            cLog(`videoId: ${videoId}`);

            let match = href.match(/[?&]t=([\dhm]+)/);
            let start = match && match.length >= 2 ? match[1] : null;
            if (start && start.indexOf('m') !== -1) {
                const parts = start.split('m');
                if (parts.length === 2) {
                    const parts2 = start.split('h');
                    if (parts2.length === 2)
                        parts[0] = parseInt(parts2[0]) * 60 + parseInt(parts2[1]);
                    start = parseInt(parts[0]) * 60 + parseInt(parts[1] || 0);
                }
            }

            // reuse previous result
            if (link.data().hoverZoomYouTubeApiVideoId === videoId) {
                if (link.data().hoverZoomYouTubeApiAudioUrl)
                    link.data().hoverZoomAudioSrc = [link.data().hoverZoomYouTubeApiAudioUrl];
                if (link.data().hoverZoomYouTubeApiVideoUrl)
                    link.data().hoverZoomSrc = [link.data().hoverZoomYouTubeApiVideoUrl];
                return;
            }

            link.data().hoverZoomYouTubeApiVideoId = videoId;
            link.data().hoverZoomYouTubeApiAudioUrl = undefined;
            link.data().hoverZoomYouTubeApiVideoUrl = undefined;

            cLog(`videoId: ${videoId} proceed with API call`);

            // proceed with API call from background page
            chrome.runtime.sendMessage({
                    action: 'ajaxRequest',
                    method: 'POST',
                    url: INNERTUBE_API_URL + INNERTUBE_API_KEY,
                    headers: [{"header": "Content-Type", "value": "application/json"}],
                    data: `{"videoId":"${videoId}","context":{"client":{"clientName":"${INNERTUBE_CLIENT_NAME}","clientVersion":"${INNERTUBE_CLIENT_VERSION}"}}}`
                },
                function (response) {
                    if (response == null) return;

                    try {
                        let j = JSON.parse(response);
                        cLog(j);

                        // check if sources are ciphered
                        if (j["streamingData"]["adaptiveFormats"][0].signatureCipher) {
                            cLog(`${videoId} : sources are encrypted`);
                            return;
                        }

                        // find the best video source (= largest width)
                        let widths = j["streamingData"]["adaptiveFormats"].map(f => (f.width ? f.width : -1));
                        let widthMax = Math.max(...widths);
                        let bestVideo = j["streamingData"]["adaptiveFormats"].find(f => f.width === widthMax);
                        cLog(`${videoId} bestVideo: ${widthMax} ${bestVideo.url}`);
                        let urlVideo = bestVideo.url + (start ? '#t=' + start : '');

                        // find best audio source (= largest bitrate)
                        let bitrates = j["streamingData"]["adaptiveFormats"].filter(f => f.mimeType.indexOf("audio/mp4") !== -1).map(f => f.bitrate);
                        let bitrateMax = Math.max(...bitrates);
                        let bestAudio = j["streamingData"]["adaptiveFormats"].filter(f => f.mimeType.indexOf("audio/mp4") !== -1).find(f => f.bitrate === bitrateMax);
                        cLog(`${videoId} bestAudio: ${bitrateMax} ${bestAudio.url}`);
                        let urlAudio = bestAudio.url + (start ? '#t=' + start : '');

                        link.data().hoverZoomYouTubeApiAudioUrl = urlAudio;
                        link.data().hoverZoomYouTubeApiVideoUrl = urlVideo;
                        link.data().hoverZoomAudioSrc = [urlAudio];
                        link.data().hoverZoomSrc = [urlVideo];

                        callback(link, name);
                        hoverZoom.displayPicFromElement(link);
                    } catch(e) {
                        cLog(e.message);
                    }
                });
        })

        hoverZoom.urlReplace(res,
            'img[src*="ytimg.com/vi/"], img[src*="ytimg.com/vi_webp/"]',
            /\/([1-9]|default|hqdefault|mqdefault)\.(jpg|webp)/,
            '/0.$2'
        );

        $('a img[data-thumb*="ytimg.com/vi/"]').each(function () {
            var img = $(this);
            img.data().hoverZoomSrc = [this.getAttribute('data-thumb').replace(/\/([1-9]|default|hqdefault|mqdefault)\.jpg/, '/0.jpg')];
            res.push(img);
        });

        callback($(res));
    }
});
