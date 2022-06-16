var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'youtube_a',
    version:'2.1',
    prepareImgLinks:function (callback) {
        var name = this.name;

        const INNERTUBE_API_URL = "https://www.youtube.com/youtubei/v1/player?key=";

        const tok_INNERTUBE_CLIENT_VERSION = "INNERTUBE_CLIENT_VERSION";
        const tok_INNERTUBE_CLIENT_NAME = "INNERTUBE_CLIENT_NAME";
        const tok_INNERTUBE_API_KEY = "INNERTUBE_API_KEY";

        var INNERTUBE_CLIENT_VERSION = "2.20211221.00.00";
        var INNERTUBE_CLIENT_NAME = "WEB";
        var INNERTUBE_API_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";

        function findParams() {
            let innerHtml = document.documentElement.innerHTML;
            let pos_INNERTUBE_CLIENT_VERSION = innerHtml.indexOf("INNERTUBE_CLIENT_VERSION");
            if (pos_INNERTUBE_CLIENT_VERSION > -1) {
                let firstquoteIndex = pos_INNERTUBE_CLIENT_VERSION + tok_INNERTUBE_CLIENT_VERSION.length + 2;
                let lastquoteIndex = innerHtml.indexOf('"', firstquoteIndex + 1);
                INNERTUBE_CLIENT_VERSION = innerHtml.substring(firstquoteIndex + 1, lastquoteIndex);
            }
            let pos_INNERTUBE_CLIENT_NAME = innerHtml.indexOf("INNERTUBE_CLIENT_NAME");
            if (pos_INNERTUBE_CLIENT_NAME > -1) {
                let firstquoteIndex = pos_INNERTUBE_CLIENT_NAME + tok_INNERTUBE_CLIENT_NAME.length + 2;
                let lastquoteIndex = innerHtml.indexOf('"', firstquoteIndex + 1);
                INNERTUBE_CLIENT_NAME = innerHtml.substring(firstquoteIndex + 1, lastquoteIndex);
            }
            let pos_INNERTUBE_API_KEY = innerHtml.indexOf("INNERTUBE_API_KEY");
            if (pos_INNERTUBE_API_KEY > -1) {
                let firstquoteIndex = pos_INNERTUBE_API_KEY + tok_INNERTUBE_API_KEY.length + 2;
                let lastquoteIndex = innerHtml.indexOf('"', firstquoteIndex + 1);
                INNERTUBE_API_KEY = innerHtml.substring(firstquoteIndex + 1, lastquoteIndex);
            }
        }

        // if header(s) rewrite is allowed store headers settings that will be used for rewrite
        if (options.allowHeadersRewrite) {
            chrome.runtime.sendMessage({
                action: "storeHeaderSettings",
                plugin: name,
                settings:
                    [{
                        "type": "request",
                        "skipInitiator": "",
                        "url": "youtube.com/youtubei/v1/player?key=",
                        "headers": [{"name": "origin", "value": "https://music.youtube.com", "typeOfUpdate": "add"}]
                    },
                    {
                        "type": "response",
                        "skipInitiator": "",
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

        findParams();

        $('a[href*="/watch?v="],a[href*="youtu.be"],div[ourl*="/watch?v="],div[ourl*="youtu.be"]').on('mouseover', function() {
            let link = undefined;
            let href = undefined;

            if ($(this).is('a')) {
                href = this.href;
                link = $(this);
            }
            if ($(this).is('div')) {
                href = $(this).attr('ourl'); // Bing
                link = $(this); // link = $(this).parent('a')[0]; link = $(link);
            }
            if (!href || !link)
                return;

            cLog('href=' + href);

            const re1 = /\/watch\?v=([^&]{1,})/;   // sample: https://www.youtube.com/watch?v=NaOiA15Rz5k
            const re2 = /\/youtu.be\/([^?]{1,})/;  // sample: https://youtu.be/qXlQbj0PgDo https://youtu.be/qORYO0atB6g?t=28
            let m = href.match(re1);
            if (!m) m = href.match(re2);
            if (!m) return;
            let videoId = m[1];
            cLog('videoId=' + videoId);

            let match = href.match(/[\?&]t=([\dhm]+)/);
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

            // resuse previous result
            if (link.data().hoverZoomYouTubeApiVideoId === videoId) {
                if (link.data().hoverZoomYouTubeApiVideoUrl)
                    link.data().hoverZoomSrc = [link.data().hoverZoomYouTubeApiVideoUrl];
                return;
            }

            link.data().hoverZoomYouTubeApiVideoId = videoId;
            link.data().hoverZoomYouTubeApiVideoUrl = undefined;

            cLog('videoId: ' + videoId + ' proceed with API call');

            // clean previous result
            link.data().hoverZoomSrc = [];

            // proceed with API call from background page
            chrome.runtime.sendMessage({
                    action: 'ajaxRequest',
                    method: 'POST',
                    url: "https://www.youtube.com/youtubei/v1/player?key=" + INNERTUBE_API_KEY,
                    headers: [{"header": "Content-Type", "value": "application/json"}],
                    data: "{\"videoId\":\"" + videoId + "\",\"context\":{\"client\":{\"clientName\":\"" + INNERTUBE_CLIENT_NAME + "\",\"clientVersion\":\"" + INNERTUBE_CLIENT_VERSION + "\"}}}"
                },
                function (response) {
                    if (response == null) return;

                    try {
                        let j = JSON.parse(response);
                        cLog(j);

                        // check if sources are ciphered
                        if (j["streamingData"]["adaptiveFormats"][0].signatureCipher) {
                            cLog(videoId + ' : sources are encrypted');
                            return;
                        }

                        // find the best video source (= largest width)
                        let widths = j["streamingData"]["adaptiveFormats"].map(f => (f.width ? f.width : -1));
                        let widthMax = Math.max(...widths);
                        let bestVideo = j["streamingData"]["adaptiveFormats"].find(f => f.width === widthMax);
                        cLog(videoId + " bestVideo: " + widthMax + " " + bestVideo.url);
                        let urlVideo = bestVideo.url + (start ? '#t=' + start : '') + ".video";

                        // find best audio source (= largest bitrate)
                        let bitrates = j["streamingData"]["adaptiveFormats"].filter(f => f.mimeType.indexOf("audio/mp4") !== -1).map(f => f.bitrate);
                        let bitrateMax = Math.max(...bitrates);
                        let bestAudio = j["streamingData"]["adaptiveFormats"].filter(f => f.mimeType.indexOf("audio/mp4") !== -1).find(f => f.bitrate === bitrateMax);
                        cLog(videoId + " bestAudio: " + bitrateMax + " " + bestAudio.url);
                        let urlAudio = bestAudio.url + (start ? '#t=' + start : '') + ".audio";

                        let urlVideoAudio = urlVideo + "_" + urlAudio;
                        link.data().hoverZoomYouTubeApiVideoUrl = urlVideoAudio;
                        link.data().hoverZoomSrc = [urlVideoAudio];

                        callback(link, name);
                        hoverZoom.displayPicFromElement(link);
                    } catch {
                    }
                });
        })
    }
});
