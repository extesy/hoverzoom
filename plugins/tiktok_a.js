var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'tiktok_a',
    version: '1.6',
    favicon:'tiktok.svg',
    prepareImgLinks: function(callback) {
        const name = this.name;

        const token1 = 'SIGI_STATE';
        const token2 = 'SIGI_RETRY';

        // if header(s) rewrite is allowed store headers settings that will be used for rewrite
        if (options.allowHeadersRewrite) {
             chrome.runtime.sendMessage({action:"storeHeaderSettings",
                                        plugin:name,
                                        settings:
                                            [{"type":"request",
                                            "skipInitiator":"tiktok",
                                            "urls":["tiktok.com"],
                                            "headers":[{"name":"referer", "value":"https://www.tiktok.com/", "typeOfUpdate":"add"},{"name":"origin", "value":"https://www.tiktok.com/", "typeOfUpdate":"add"}]},
                                            {"type":"response",
                                            "skipInitiator":"tiktok",
                                            "urls":["tiktok.com"],
                                            "headers":[{"name":"Access-Control-Allow-Origin", "value":"*", "typeOfUpdate":"add"},{"name":"Cross-Origin-Resource-Policy", "typeOfUpdate":"remove"}]}]
                                        });
        }

        function getCookie(cname) {
            let name = cname + "=";
            var ca = document.cookie.split(';');
            for(let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1);
                if (c.indexOf(name) == 0)
                    return c.substring(name.length,c.length);
            }
            return "";
        }

        var XDeviceID = getCookie('unique_id') || getCookie('unique_id_durable') || localStorage.local_copy_unique_id || 'd56e8463c57c7cd7';

        function getVideo(videoId, jsonData, link) {
            try {
                const j = JSON.parse(jsonData);
                let audioUrl = j.__DEFAULT_SCOPE__['webapp.video-detail']['itemInfo']['itemStruct']["music"]["playUrl"];
                if (audioUrl) audioUrl += '.audiomuted'; // there is already a soundtrack in video, this one is only for download
                const videoUrlPlay = j.__DEFAULT_SCOPE__['webapp.video-detail']['itemInfo']['itemStruct']["video"]["playAddr"];
                const videoUrlDownload = j.__DEFAULT_SCOPE__['webapp.video-detail']['itemInfo']['itemStruct']["video"]["downloadAddr"];
                let videoUrl = (videoUrlDownload ? videoUrlDownload : videoUrlPlay);
                const caption = j.__DEFAULT_SCOPE__['webapp.video-detail']['shareMeta'].title;
                if (videoUrl) videoUrl += '.video';
                if (videoUrl) {
                    const urlVideoAudio = (audioUrl ? videoUrl + "_" + audioUrl : videoUrl);
                    link.data().hoverZoomTikTokVideoUrl = urlVideoAudio;
                    link.data().hoverZoomTikTokVideoCaption = caption;
                    link.data().hoverZoomSrc = [urlVideoAudio];
                    link.data().hoverZoomCaption = caption;
                    callback(link, name);
                    // Gallery is displayed iff the cursor is still over the link
                    if (data.hoverZoomMouseOver)
                        hoverZoom.displayPicFromElement(link);
                }
            } catch {}
        }

        function getLive(liveId, jsonData, link) {
            try {
                const j = JSON.parse(jsonData);
                var streamData = j["LiveRoom"]["liveRoomUserInfo"]["liveRoom"]["streamData"]["pull_data"]["stream_data"];
                streamData = JSON.stringify(streamData).replaceAll("\\u002F", "//").replaceAll("\\", "").replaceAll(" ", "").replaceAll("\"{", "{").replaceAll("}\"", "}");
                const caption = j["LiveRoom"]["liveRoomUserInfo"]["liveRoom"].title;
                const originM3u8 = JSON.parse(streamData).data.origin.main.hls;
                if (originM3u8) {
                    link.data().hoverZoomTikTokLiveUrl = originM3u8;
                    link.data().hoverZoomTikTokLiveCaption = caption;
                    link.data().hoverZoomSrc = [originM3u8];
                    link.data().hoverZoomCaption = caption;

                    callback(link, name);
                    // Gallery is displayed iff the cursor is still over the link
                    if (data.hoverZoomMouseOver)
                        hoverZoom.displayPicFromElement(link);
                }
            } catch {}
        }

        function getAvatar(userId, jsonData, link) {
            try {
                const j = JSON.parse(jsonData);
                const avatarUrl = j.__DEFAULT_SCOPE__['webapp.user-detail']['userInfo']['user'].avatarLarger;
                const caption = j.__DEFAULT_SCOPE__['webapp.user-detail']['userInfo']['user'].nickname;

                if (avatarUrl) {
                    link.data().hoverZoomTikTokAvatarUrl = avatarUrl;
                    link.data().hoverZoomTikTokAvatarCaption = caption;
                    link.data().hoverZoomSrc = [avatarUrl];
                    link.data().hoverZoomCaption = caption;
                    callback(link, name);
                    // Gallery is displayed iff the cursor is still over the link
                    if (data.hoverZoomMouseOver)
                        hoverZoom.displayPicFromElement(link);
                }
            } catch {}
        }

        function getGallery(videoId, jsonData, link) {
            try {
                const j = JSON.parse(jsonData);
                const images = j.__DEFAULT_SCOPE__['webapp.video-detail']['itemInfo']['itemStruct']['imagePost']['images'];
                const caption = j.__DEFAULT_SCOPE__['webapp.video-detail']['shareMeta'].title;

                const gallery = images.map(i => [i.imageURL.urlList[0]]);
                const captions = images.map(i => caption);;

                if (gallery) {

                    link.data().hoverZoomTikTokPhotoGallery = gallery;
                    link.data().hoverZoomTikTokPhotoCaptions = captions;
                    link.data().hoverZoomGallerySrc = gallery;
                    link.data().hoverZoomGalleryCaption = captions;

                    callback(link, name);
                    // Gallery is displayed iff the cursor is still over the link
                    if (data.hoverZoomMouseOver)
                        hoverZoom.displayPicFromElement(link);
                }
            } catch {}
        }

        // load user page then extract user picture url
        function getUserPictureFromPage(userUrl, userId, link) {
            chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:userUrl,
                                        headers:[{"header":"Content-Type","value":"application/json"}]},

                                        function (response) {

                                            if (response == null) { return; }

                                            // extract JSON data
                                            const parser = new DOMParser();
                                            const doc = parser.parseFromString(response, "text/html");
                                            if (doc.scripts['__UNIVERSAL_DATA_FOR_REHYDRATION__'] == undefined) { return; }
                                            const jsonData = doc.scripts['__UNIVERSAL_DATA_FOR_REHYDRATION__'].text;
                                            getAvatar(userId, jsonData, link);
                                        });
        }

        // profile pictures
        // sample: https://www.tiktok.com/@francerugby
        $('a[href*="/@"]').filter(function() { return (/www.tiktok.com\/@[^\/]{1,}$/.test($(this).prop('href'))) }).one('mouseover', function() {
            const href = this.href;
            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            const re1 = /www.tiktok.com\/@([^\/?]{1,})/;   // user id (francerugby)
            const m = href.match(re1);
            if (m == undefined) return;
            const userId = m[1];

            // reuse previous result
            if (link.data().hoverZoomTikTokUserId == userId) {
                if (link.data().hoverZoomTikTokAvatarUrl) link.data().hoverZoomSrc = [link.data().hoverZoomTikTokAvatarUrl];
                if (link.data().hoverZoomTikTokAvatarCaption) link.data().hoverZoomCaption = link.data().hoverZoomTikTokAvatarCaption;
                return;
            }

            link.data().hoverZoomTikTokUserId = userId;
            link.data().hoverZoomTikTokAvatarUrl = undefined;
            link.data().hoverZoomTikTokAvatarCaption = undefined;

            // clean previous result
            link.data().hoverZoomSrc = [];
            getUserPictureFromPage(href, userId, link);
        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // load video page then extract video url
        function getVideoFromPage(videoUrl, videoId, link) {
            chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:videoUrl,
                                        headers:[{"header":"Content-Type","value":"application/json"}]},

                                        function (response) {

                                            if (response == null) { return; }

                                            // extract JSON data
                                            const parser = new DOMParser();
                                            const doc = parser.parseFromString(response, "text/html");
                                            if (doc.scripts['__UNIVERSAL_DATA_FOR_REHYDRATION__'] == undefined) { return; }
                                            const jsonData = doc.scripts['__UNIVERSAL_DATA_FOR_REHYDRATION__'].text;
                                            getVideo(videoId, jsonData, link);
                                        });
        }

        // videos ("vm" or "vt" kind, as used on Reddit)
        // sample: https://vm.tiktok.com/TTPdkHATKx/
        $('a[href*="vm.tiktok.com/"], a[href*="vt.tiktok.com/"]').one('mouseover', function() {
            const href = this.href;
            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            const re = /v[mt].tiktok.com\/([^\/?]{1,})/;   // pseudo video id (e.g. TTPdkHATKx)
            const m = href.match(re);
            if (m == undefined) return;
            const pseudoVideoId = m[1];

            // reuse previous result
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
        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // videos
        //   sample: https://www.tiktok.com/@francerugby/video/7057929275810401541
        // => audio: https://sf16-ies-music-va.tiktokcdn.com/obj/musically-maliva-obj/7057929269015530246.mp3
        // => video: https://v16-webapp.tiktok.com/cc389c6a68701f5a2e56fe39b2206a0d/61fc68db/video/tos/useast2a/tos-useast2a-pve-0068/09d6f7e3e4e64b54890746c1b5df9a2f/?a=1988&br=2326&bt=1163&cd=0%7C0%7C1%7C0&ch=0&cr=0&cs=0&cv=1&dr=0&ds=3&er=&ft=XOQ9-3D_nz7TheIAxlXq&l=202202031744150102231230461D200629&lr=tiktok_m&mime_type=video_mp4&net=0&pl=0&qs=0&rc=ajhyZzg6ZmhmOjMzNzczM0ApPDpnaTk3NmQ5N2VkZjc7NWc2YjMzcjRvbm1gLS1kMTZzc2EvLzYzXzJhYWFeL2FhYWI6Yw%3D%3D&vl=&vr=
        $('a[href*="/@"]').filter(function() { return (/www.tiktok.com\/@.*\/video\/\d+/.test($(this).prop('href'))) }).one('mouseover', function() {
            const href = this.href;
            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            const re1 = /www.tiktok.com\/@(.*)\/video\/\d+/;   // user id (e.g. colexicano)
            let m = href.match(re1);
            if (m == undefined) return;
            const userId = m[1];

            const re2 = /www.tiktok.com\/@.*\/video\/(\d+)/;   // video id (e.g. 7013483135040032005)
            m = href.match(re2);
            if (m == undefined) return;
            const videoId = m[1];

            // reuse previous result
            if (link.data().hoverZoomTikTokVideoId == videoId) {
                if (link.data().hoverZoomTikTokVideoUrl) link.data().hoverZoomSrc = [link.data().hoverZoomTikTokVideoUrl];
                if (link.data().hoverZoomTikTokVideoCaption) link.data().hoverZoomCaption = link.data().hoverZoomTikTokVideoCaption;
                return;
            }

            link.data().hoverZoomTikTokVideoId = videoId;
            link.data().hoverZoomTikTokVideoUrl = undefined;
            link.data().hoverZoomTikTokVideoCaption = undefined;

            // clean previous result
            link.data().hoverZoomSrc = [];
            getVideoFromPage(href, videoId, link);
        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // load user page then extract original M3U8
        function getLiveFromPage(userUrl, userId, link) {

             chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:userUrl,
                                        headers:[{"header":"Content-Type","value":"application/json"}]},
                                        function (response) {

                                            if (response == null) { return; }

                                            // extract JSON data
                                            const parser = new DOMParser();
                                            const doc = parser.parseFromString(response, "text/html");
                                            if (doc.scripts['SIGI_STATE'] == undefined) { return; }
                                            const jsonData = doc.scripts['SIGI_STATE'].text;
                                            const liveId = undefined;
                                            getLive(liveId, jsonData, link);
                                        })
        }

        // load photos gallery using video url
        function getPhotoFromPage(photoUrl, videoId, link) {
            chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:photoUrl, // sample: 'https://www.tiktok.com/@mikki_loop/video/7265361273989221638',
                                        headers:[{"header":"Content-Type","value":"application/json"}]},

                                        function (response) {

                                            if (response == null) { return; }

                                            // extract JSON data
                                            const parser = new DOMParser();
                                            const doc = parser.parseFromString(response, "text/html");
                                            if (doc.scripts['__UNIVERSAL_DATA_FOR_REHYDRATION__'] == undefined) { return; }
                                            const jsonData = doc.scripts['__UNIVERSAL_DATA_FOR_REHYDRATION__'].text;
                                            getGallery(videoId, jsonData, link);
                                        });
        }

        // live
        // sample: https://www.tiktok.com/@benoit_chevalier/live
        $('a[href*="/@"]').filter(function() { return (/www.tiktok.com\/@.*\/live/.test($(this).prop('href'))) }).one('mouseover', function() {
            const href = this.href;
            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            const re1 = /www.tiktok.com\/@([^\/?]{1,})/;   // user id (e.g. benoit_chevalier)
            const m = href.match(re1);
            if (m == undefined) return;
            const userId = m[1];

            // reuse previous result
            if (link.data().hoverZoomTikTokUserId == userId) {
                if (link.data().hoverZoomTikTokLiveUrl) link.data().hoverZoomSrc = [link.data().hoverZoomTikTokLiveUrl];
                if (link.data().hoverZoomTikTokLiveCaption) link.data().hoverZoomCaption = link.data().hoverZoomTikTokLiveCaption;
                return;
            }

            link.data().hoverZoomTikTokUserId = userId;
            link.data().hoverZoomTikTokLiveUrl = undefined;
            link.data().hoverZoomTikTokLiveCaption = undefined;

            // clean previous result
            link.data().hoverZoomSrc = [];
            getLiveFromPage(href, userId, link);
        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // photos gallery
        // sample: https://www.tiktok.com/@creepy_g0re_130/photo/7305139211676437765
        $('a[href*="/@"]').filter(function() { return (/www.tiktok.com\/@.*\/photo/.test($(this).prop('href'))) }).one('mouseover', function() {
            const href = this.href;
            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            const re1 = /www.tiktok.com\/@([^\/?]{1,})/;   // user id (e.g. benoit_chevalier)
            const m = href.match(re1);
            if (m == undefined) return;
            const userId = m[1];

            // reuse previous result
            if (link.data().hoverZoomTikTokUserId == userId) {
                if (link.data().hoverZoomTikTokPhotoGallery) link.data().hoverZoomGallerySrc = [link.data().hoverZoomTikTokPhotoGallery];
                if (link.data().hoverZoomTikTokPhotoCaption) link.data().hoverZoomGalleryCaption = link.data().hoverZoomTikTokPhotoCaption;
                return;
            }

            link.data().hoverZoomTikTokUserId = userId;
            link.data().hoverZoomTikTokPhotoGallery = undefined;
            link.data().hoverZoomTikTokPhotoCaption = undefined;

            // clean previous result
            link.data().hoverZoomGallerySrc = [];
            getPhotoFromPage(href.replace('/photo/', '/video/'), userId, link);
        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // direct API call with video id
        // sample: https://www.tiktok.com/api/img/?itemId=7064678143478566190&location=0&aid=1988
        $('a[href*="itemId"]').filter(function() { return (/www.tiktok.com\/.*\/\?itemId=\d+/.test($(this).prop('href'))) }).on('mouseover', function() {

            const href = this.href;
            const link = $(this);

            const re1 = /www.tiktok.com\/.*\/\?itemId=(\d+)/;   // video id (e.g. 7064678143478566190)
            const m = href.match(re1);
            if (m == undefined) return;
            const videoId = m[1];

            // reuse previous result
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
