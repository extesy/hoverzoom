var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'tiktok_a',
    version: '1.4',
    prepareImgLinks: function(callback) {
        var name = this.name;

        const token1 = 'SIGI_STATE';
        const token2 = 'SIGI_RETRY';

        // if header(s) rewrite is allowed store headers settings that will be used for rewrite
        if (options.allowHeadersRewrite) {
             chrome.runtime.sendMessage({action:"storeHeaderSettings",
                                        plugin:name,
                                        settings:
                                            [{"type":"request",
                                            "skipInitiator":"tiktok",
                                            "url":"tiktok.com",
                                            "headers":[{"name":"referer", "value":"https://www.tiktok.com/", "typeOfUpdate":"add"}]},
                                            {"type":"response",
                                            "skipInitiator":"tiktok",
                                            "url":"tiktok.com",
                                            "headers":[{"name":"Access-Control-Allow-Origin", "value":"*", "typeOfUpdate":"add"}]}]
                                        });
        }

        function getVideo(videoId, jsonData, link) {
            try {
                const j = JSON.parse(jsonData);
                let audioUrl = j["itemInfo"] ? j["itemInfo"]["itemStruct"]["music"]["playUrl"] : j["ItemModule"][videoId]["music"]["playUrl"];
                if (audioUrl) audioUrl += '.audiomuted'; // there is already a soundtrack in video, this one is only for download
                const videoUrlPlay = j["itemInfo"] ? j["itemInfo"]["itemStruct"]["video"]["playAddr"] : j["ItemModule"][videoId]["video"]["playAddr"];
                const videoUrlDownload = j["itemInfo"] ? j["itemInfo"]["itemStruct"]["video"]["downloadAddr"] : j["ItemModule"][videoId]["video"]["downloadAddr"];
                let videoUrl = (videoUrlDownload ? videoUrlDownload : videoUrlPlay);
                if (videoUrl) videoUrl += '.video';
                if (videoUrl) {
                    const urlVideoAudio = (audioUrl ? videoUrl + "_" + audioUrl : videoUrl);
                    link.data().hoverZoomTikTokVideoUrl = urlVideoAudio;
                    link.data().hoverZoomSrc = [urlVideoAudio];
                    callback(link, name);
                    hoverZoom.displayPicFromElement(link);
                }
            } catch {}
        }

        // load user page then extract user picture url
        // proceed with API call from background page
        function getUserPictureFromPage(userUrl, userId, link) {
            chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:userUrl,
                                        headers:[{"header":"Content-Type","value":"application/json"}]},

                                        function (response) {
                                            if (response == null) { return; }

                                            // extract JSON data
                                            const index1 = response.indexOf(token1);
                                            if (index1 == -1) { return; }
                                            const index2 = response.indexOf(token2, index1);
                                            if (index2 == -1) { return; }
                                            const index3 = response.indexOf('{', index1);
                                            const index4 = response.lastIndexOf('}', index2);
                                            const jsonData = response.substring(index3, index4 + 1);
                                            try {
                                                const j = JSON.parse(jsonData);
                                                const avatarUrl = j["UserModule"]["users"][userId]["avatarLarger"];

                                                if (avatarUrl) {
                                                    link.data().hoverZoomTikTokAvatarUrl = avatarUrl;
                                                    link.data().hoverZoomSrc = [avatarUrl];
                                                    callback(link, name);
                                                    hoverZoom.displayPicFromElement(link);
                                                }
                                            } catch {}
                                        });
        }

        // profile pictures
        // sample: https://www.tiktok.com/@francerugby
        $('a[href*="/@"]').filter(function() { return (/www.tiktok.com\/@[^\/]{1,}$/.test($(this).prop('href'))) }).on('mouseover', function() {

            const href = this.href;
            const link = $(this);

            const re1 = /www.tiktok.com\/@([^\/?]{1,})/;   // user id (francerugby)
            const m = href.match(re1);
            if (m == undefined) return;
            const userId = m[1];

            // resuse previous result
            if (link.data().hoverZoomTikTokUserId == userId) {
                if (link.data().hoverZoomTikTokAvatarUrl) link.data().hoverZoomSrc = [link.data().hoverZoomTikTokAvatarUrl];
                return;
            }

            link.data().hoverZoomTikTokUserId = userId;
            link.data().hoverZoomTikTokAvatarUrl = undefined;

            // clean previous result
            link.data().hoverZoomSrc = [];
            getUserPictureFromPage(href, userId, link);
        })

        // load video page then extract video url
        // proceed with API call from background page
        function getVideoFromPage(videoUrl, videoId, link) {
            chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:videoUrl,
                                        headers:[{"header":"Content-Type","value":"application/json"}]},

                                        function (response) {

                                            if (response == null) { return; }

                                            // extract JSON data
                                            const index1 = response.indexOf(token1);
                                            if (index1 == -1) { return; }
                                            const index2 = response.indexOf(token2, index1);
                                            if (index2 == -1) { return; }
                                            const index3 = response.indexOf('{', index1);
                                            const index4 = response.lastIndexOf('}', index2);
                                            const jsonData = response.substring(index3, index4 + 1);
                                            if (videoId == undefined) {
                                                const m = jsonData.match(/"video":{"id":"(\d+)"/);
                                                videoId = m[1];
                                            }
                                            getVideo(videoId, jsonData, link);
                                        });
        }

        // videos ("vm" or "vt" kind, as used on Reddit)
        // sample: https://vm.tiktok.com/TTPdkHATKx/
        $('a[href*="vm.tiktok.com/"],a[href*="vt.tiktok.com/"]').on('mouseover', function() {

            const href = this.href;
            const link = $(this);

            const re = /v[mt].tiktok.com\/([^\/?]{1,})/;   // pseudo video id (e.g. TTPdkHATKx)
            const m = href.match(re);
            if (m == undefined) return;
            const pseudoVideoId = m[1];

            // resuse previous result
            if (link.data().hoverZoomTikTokVideoId == pseudoVideoId) {
                if (link.data().hoverZoomTikTokVideoUrl) link.data().hoverZoomSrc = [link.data().hoverZoomTikTokVideoUrl];
                return;
            }

            link.data().hoverZoomTikTokVideoId = pseudoVideoId;
            link.data().hoverZoomTikTokVideoUrl = undefined;

            // clean previous result
            link.data().hoverZoomSrc = [];

            // pseudo video id can not be used, the correct one will be found once page is loaded
            getVideoFromPage(href, undefined, link);
        })

        // videos
        //   sample: https://www.tiktok.com/@francerugby/video/7057929275810401541
        // => audio: https://sf16-ies-music-va.tiktokcdn.com/obj/musically-maliva-obj/7057929269015530246.mp3
        // => video: https://v16-webapp.tiktok.com/cc389c6a68701f5a2e56fe39b2206a0d/61fc68db/video/tos/useast2a/tos-useast2a-pve-0068/09d6f7e3e4e64b54890746c1b5df9a2f/?a=1988&br=2326&bt=1163&cd=0%7C0%7C1%7C0&ch=0&cr=0&cs=0&cv=1&dr=0&ds=3&er=&ft=XOQ9-3D_nz7TheIAxlXq&l=202202031744150102231230461D200629&lr=tiktok_m&mime_type=video_mp4&net=0&pl=0&qs=0&rc=ajhyZzg6ZmhmOjMzNzczM0ApPDpnaTk3NmQ5N2VkZjc7NWc2YjMzcjRvbm1gLS1kMTZzc2EvLzYzXzJhYWFeL2FhYWI6Yw%3D%3D&vl=&vr=
        $('a[href*="/@"]').filter(function() { return (/www.tiktok.com\/@.*\/video\/\d+/.test($(this).prop('href'))) }).on('mouseover', function() {

            const href = this.href;
            const link = $(this);

            const re1 = /www.tiktok.com\/@(.*)\/video\/\d+/;   // user id (e.g. colexicano)
            let m = href.match(re1);
            if (m == undefined) return;
            const userId = m[1];

            const re2 = /www.tiktok.com\/@.*\/video\/(\d+)/;   // video id (e.g. 7013483135040032005)
            m = href.match(re2);
            if (m == undefined) return;
            const videoId = m[1];

            // resuse previous result
            if (link.data().hoverZoomTikTokVideoId == videoId) {
                if (link.data().hoverZoomTikTokVideoUrl) link.data().hoverZoomSrc = [link.data().hoverZoomTikTokVideoUrl];
                return;
            }

            link.data().hoverZoomTikTokVideoId = videoId;
            link.data().hoverZoomTikTokVideoUrl = undefined;

            // clean previous result
            link.data().hoverZoomSrc = [];
            getVideoFromPage(href, videoId, link);
        })

        // load user page then extract room id url
        // if room id is not undefined then load playlist
        // proceed with API call from background page
        function getLiveFromPage(userUrl, userId, link) {

             chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:userUrl,
                                        headers:[{"header":"Content-Type","value":"application/json"}]},
                                        function (response) {
                                            // extract JSON data
                                            const index1 = response.indexOf(token1);
                                            if (index1 == -1) { return; }
                                            const index2 = response.indexOf(token2, index1);
                                            if (index2 == -1) { return; }
                                            const index3 = response.indexOf('{', index1);
                                            const index4 = response.lastIndexOf('}', index2);
                                            const jsonData = response.substring(index3, index4 + 1);
                                            try {
                                                const j = JSON.parse(jsonData);
                                                const roomId = j["UserModule"]["users"][userId]["roomId"];
                                                if (roomId == undefined) return; // no live to display

                                                chrome.runtime.sendMessage({action:'ajaxRequest',
                                                method:'GET',
                                                url:"https://webcast.tiktok.com/webcast/room/info/?aid=1988&room_id=" + roomId,
                                                headers:[{"header":"Content-Type","value":"application/json"}]},

                                                function (response) {

                                                    if (response == null) { return; }

                                                    try {
                                                        const l = JSON.parse(response);
                                                        const hls_pull_url = l['data']['stream_url'].hls_pull_url;
                                                        if (hls_pull_url) {
                                                            link.data().hoverZoomTikTokLiveUrl = hls_pull_url;
                                                            link.data().hoverZoomSrc = [hls_pull_url];
                                                            callback(link, name);
                                                            hoverZoom.displayPicFromElement(link);
                                                        }

                                                    } catch {}
                                                })

                                            } catch {}
                                        })
        }

        // live
        // sample: https://www.tiktok.com/@benoit_chevalier/live
        $('a[href*="/@"]').filter(function() { return (/www.tiktok.com\/@.*\/live/.test($(this).prop('href'))) }).on('mouseover', function() {

            const href = this.href;
            const link = $(this);

            const re1 = /www.tiktok.com\/@([^\/?]{1,})/;   // user id (e.g. benoit_chevalier)
            const m = href.match(re1);
            if (m == undefined) return;
            const userId = m[1];

            // resuse previous result
            if (link.data().hoverZoomTikTokUserId == userId) {
                if (link.data().hoverZoomTikTokLiveUrl) link.data().hoverZoomSrc = [link.data().hoverZoomTikTokLiveUrl];
                return;
            }

            link.data().hoverZoomTikTokUserId = userId;
            link.data().hoverZoomTikTokLiveUrl = undefined;

            // clean previous result
            link.data().hoverZoomSrc = [];
            getLiveFromPage(href, userId, link);
        })

        // direct API call with video id
        // sample: https://www.tiktok.com/api/img/?itemId=7064678143478566190&location=0&aid=1988
        $('a[href*="itemId"]').filter(function() { return (/www.tiktok.com\/.*\/\?itemId=\d+/.test($(this).prop('href'))) }).on('mouseover', function() {

            const href = this.href;
            const link = $(this);

            const re1 = /www.tiktok.com\/.*\/\?itemId=(\d+)/;   // video id (e.g. 7064678143478566190)
            const m = href.match(re1);
            if (m == undefined) return;
            const videoId = m[1];

            // resuse previous result
            if (link.data().hoverZoomTikTokVideoId == videoId) {
                if (link.data().hoverZoomTikTokVideoUrl) link.data().hoverZoomSrc = [link.data().hoverZoomTikTokVideoUrl];
                return;
            }

            link.data().hoverZoomTikTokVideoId = videoId;
            link.data().hoverZoomTikTokVideoUrl = undefined;

            // clean previous result
            link.data().hoverZoomSrc = [];

            chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:'https://www.tiktok.com/api/item/detail/?itemId=' + videoId,
                                        headers:[{"header":"Content-Type","value":"application/json"}]},

                                        function (response) {
                                            getVideo(videoId, response, link);
                                        })
        })

    }
});
