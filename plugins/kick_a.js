var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'kick_a',
    version:'0.5',
    prepareImgLinks:function (callback) {
        var name = this.name;
        var res = [];

        // if header(s) rewrite is allowed store headers settings that will be used for rewrite
        if (options.allowHeadersRewrite) {
             chrome.runtime.sendMessage({action:"storeHeaderSettings",
                                        plugin:name,
                                        settings:
                                            [{"type":"request",
                                            "skipInitiator":"kick",
                                            "urls":["kick.com","hls.live-video.net","playback.live-video.net"],
                                            "headers":[{"name":"referer", "value":"https://kick.com", "typeOfUpdate":"add"},{"name":"origin", "value":"https://kick.com", "typeOfUpdate":"add"}]},
                                            {"type":"response",
                                            "skipInitiator":"kick",
                                            "urls":["kick.com","hls.live-video.net","playback.live-video.net"],
                                            "headers":[{"name":"Access-Control-Allow-Origin", "value":"*", "typeOfUpdate":"add"}]}]
                                        });
        }

        // clips
        // thumbnail url: https://clips.kick.com/clips/cacd6b78-e0d8-49fa-976f-8672d35c7bfa-thumbnail.jpeg
        //   => clip url: https://clips.kick.com/clips/cacd6b78-e0d8-49fa-976f-8672d35c7bfa.mp4
        // thumbnail url: https://clips.kick.com/clips/clip_01H6KQJC31DGZVGENT05PWM7R3/thumbnail.png
        //   => clip url: https://clips.kick.com/clips/clip_01H6KQJC31DGZVGENT05PWM7R3/playlist.m3u8
        $('img[src*="clips.kick.com/clips/"]').one('mouseover', function() {
            const src = this.src;
            var link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            const clipUrl = src.replace('-thumbnail.jpeg', '.mp4').replace('/thumbnail.png', '/playlist.m3u8');
            if (clipUrl == src) return;
            link.data().hoverZoomSrc = [clipUrl];
            callback(link, name);
            // Image is displayed if the cursor is still over the link
            if (link.data().hoverZoomMouseOver)
                hoverZoom.displayPicFromElement(link);
        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // videos
        //         href: https://kick.com/video/bed2156f-e0ac-48e3-9d63-11581b9aa614
        // => video url: https://stream.kick.com/ivs/v1/196233775518/1J3T5DLBzrog/2023/3/19/4/33/FqB89JgRJg0c/media/hls/master.m3u8
        $('a[href]').filter(function() { return (/kick\.com\/\S*\/videos\//.test($(this).prop('href'))) }).one('mouseover', function() {
            const href = this.href;
            var link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            const re = /kick\.com\/\S*\/videos\/(.*)/;   // video id (e.g. d1f27b01-abd8-47f2-a52a-5b2c22044d3b)
            m = href.match(re);
            if (m == undefined) return;
            const videoId = m[1];

            // reuse previous result
            if (link.data().hoverZoomKickVideoId == videoId) {
                if (link.data().hoverZoomKickVideoUrl) link.data().hoverZoomSrc = [link.data().hoverZoomKickVideoUrl];
                return;
            }

            link.data().hoverZoomKickVideoId = videoId;
            link.data().hoverZoomKickVideoUrl = undefined;

            chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:'https://kick.com/api/v1/video/' + videoId},
                                        function (response) {
                                            try {
                                                const j = JSON.parse(response);
                                                const videoUrl = j.source || j.livestream.channel.playback_url;
                                                if (videoUrl) {
                                                    link.data().hoverZoomKickVideoUrl = videoUrl;
                                                    link.data().hoverZoomSrc = [videoUrl];
                                                    callback(link, name);
                                                    // Image is displayed if the cursor is still over the link
                                                    if (link.data().hoverZoomMouseOver)
                                                        hoverZoom.displayPicFromElement(link);
                                                }
                                            } catch {}
                                        });
        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // live
        //        href: https://kick.com/aleea
        // => live url: https://fa723fc1b171.us-west-2.playback.live-video.net/api/video/v1/us-west-2.196233775518.channel.1IvyLgocb1PI.m3u8?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzM4NCJ9.eyJhd3M6Y2hhbm5lbC1hcm4iOiJhcm46YXdzOml2czp1cy13ZXN0LTI6MTk2MjMzNzc1NTE4OmNoYW5uZWwvMUl2eUxnb2NiMVBJIiwiYXdzOmFjY2Vzcy1jb250cm9sLWFsbG93LW9yaWdpbiI6Imh0dHBzOi8va2ljay5jb20iLCJhd3M6c3RyaWN0LW9yaWdpbi1lbmZvcmNlbWVudCI6ZmFsc2UsImV4cCI6MTY3OTI0OTU0OX0.DeM-3K2LOzPU2uNaYx2pvqj0R-35XBGQGJ0_uVKV8QPMQ2laQa_ENZ0FsDsXPqMJ2R7HLZZMY_Ep9cLMojO9sF87g2Wp8vQ203kJ1YXOjbsj1hZHDGTB4oEaTkSPtWr4
        $('a[href]').filter(function() { return (! /kick\.com\/video\//.test($(this).prop('href')) && /kick\.com\/[^\/]{1,}/.test($(this).prop('href'))) }).one('mouseover', function() {
            const href = this.href;
            var link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            const re = /kick\.com\/(.*)/;   // live id (e.g. aleea)
            m = href.match(re);
            if (m == undefined) return;
            const liveId = m[1];

            // reuse previous result
            if (link.data().hoverZoomKickLiveId == liveId) {
                if (link.data().hoverZoomKickLiveUrl) link.data().hoverZoomSrc = [link.data().hoverZoomKickLiveUrl];
                return;
            }

            link.data().hoverZoomKickLiveId = liveId;
            link.data().hoverZoomKickLiveUrl = undefined;

            //https://kick.com/api/v1/channels/exodus
            chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:'https://kick.com/api/v1/channels/' + liveId},
                                        function (response) {
                                            try {
                                                const j = JSON.parse(response);
                                                const liveUrl = j.playback_url;
                                                if (liveUrl) {
                                                    link.data().hoverZoomKickLiveUrl = liveUrl;
                                                    link.data().hoverZoomSrc = [liveUrl];
                                                    callback(link, name);
                                                    // Image is displayed if the cursor is still over the link
                                                    if (link.data().hoverZoomMouseOver)
                                                        hoverZoom.displayPicFromElement(link);
                                                }
                                            } catch {}
                                        });
        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        hoverZoom.urlReplace(res,
            'img[src*="kick.com/images/user/"]',
            ['/conversion/', /-(thumb|medium|fullsize)\.webp/],
            ['/', '']
        );

        callback($(res), name);
    }
});
