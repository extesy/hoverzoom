var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'dailymotion_a',
    version: '1.6',
    prepareImgLinks: function(callback) {
        var name = this.name;

        // if header(s) rewrite is allowed store headers settings that will be used for rewrite
        if (options.allowHeadersRewrite) {
            chrome.runtime.sendMessage({action:"storeHeaderSettings",
                                        plugin:name,
                                        settings:
                                            [{"type":"request",
                                            "skipInitiator":"dailymotion",
                                            "urls":["dailymotion.com"],
                                            "headers":[{"name":"referer", "value":"https://www.dailymotion.com/", "typeOfUpdate":"add"}]},
                                            {"type":"response",
                                            "skipInitiator":"dailymotion",
                                            "urls":["dailymotion.com", "dmcdn.net"],
                                            "headers":[{"name":"Access-Control-Allow-Origin", "value":"*", "typeOfUpdate":"add"}]}]
                                        });
        }

        // users
        // sample: https://www.dailymotion.com/CanalplusSport
        $('a[href]').filter(function() { return (/dailymotion\.com\/[^\/]{1,}$/.test($(this).prop('href'))) }).one('mouseover', function() {
            var link = $(this);
            var href = this.href;
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            const re = /dailymotion\.com\/([^\/\?]{1,})$/;   // user (e.g. CanalplusSport)
            m = href.match(re);
            if (m == undefined) return;
            let user = m[1];

            // reuse previous result
            if (link.data().hoverZoomDailyMotionUser == user) {
                if (link.data().hoverZoomDailyMotionUserUrl) link.data().hoverZoomSrc = [link.data().hoverZoomDailyMotionUserUrl];
                return;
            }

            link.data().hoverZoomDailyMotionUser = user;
            link.data().hoverZoomDailyMotionUserUrl = undefined;

            // clean previous result
            link.data().hoverZoomSrc = [];
            getUserFromAPI(user, link);
        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        function getUserFromAPI(user, link) {
            chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:'https://api.dailymotion.com/user/' + user + '?fields=avatar_720_url',
                                        headers:[{"header":"Content-Type","value":"application/json"}]},
                                        function (response) {
                                            if (response) {
                                                try {
                                                    let j = JSON.parse(response);
                                                    let userUrl = j.avatar_720_url;
                                                    if (userUrl) {
                                                        link.data().hoverZoomDailyMotionUserUrl = userUrl;
                                                        link.data().hoverZoomSrc = [userUrl];
                                                        callback(link, name);
                                                        // Image or video is displayed iff the cursor is still over the link
                                                        if (link.data().hoverZoomMouseOver)
                                                            hoverZoom.displayPicFromElement(link);
                                                    }
                                                } catch {}
                                            }
                                        });
        }

        // playlists
        // sample: https://www.dailymotion.com/playlist/x7292h
        $('a[href*="/playlist/"]').filter(function() { return (/dailymotion\.com\/playlist\//.test($(this).prop('href'))) }).one('mouseover', function() {
            var link = $(this);
            var href = this.href;
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            const re = /dailymotion\.com\/playlist\/([^\/\?]{1,})/;   // playlist id (e.g. x7292h)
            m = href.match(re);
            if (m == undefined) return;
            let playlistId = m[1];

            // reuse previous result
            if (link.data().hoverZoomDailyMotionPlaylistId == playlistId) {
                if (link.data().hoverZoomDailyMotionPlaylistUrls) link.data().hoverZoomGallerySrc = link.data().hoverZoomDailyMotionPlaylistUrls;
                return;
            }

            link.data().hoverZoomDailyMotionPlaylistId = playlistId;
            link.data().hoverZoomDailyMotionPlaylistUrls = [];

            // clean previous result
            link.data().hoverZoomSrc = [];
            getPlaylistFromAPI(playlistId, link);
        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        function getPlaylistFromAPI(playlistId, link) {
            chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:'https://api.dailymotion.com/playlist/' + playlistId + '/videos?limit=100',
                                        headers:[{"header":"Content-Type","value":"application/json"}]},
                                        function (response) {
                                            try {
                                                let j = JSON.parse(response);
                                                let nb = j.list.length;
                                                for (let i = 0; i < nb; i++) {
                                                    let videoId = j.list[i].id;
                                                    getVideosFromAPI(videoId, link, nb, i);
                                                }
                                            } catch {}
                                        });
        }

        // videos
        // sample: https://www.dailymotion.com/video/x8994nm
        //         https://dai.ly/x4v3maz
        $('a[href*="/video/"], a[href*="dai.ly/"]').filter(function() { return ( (/dailymotion\.com(\/embed)?\/video\//.test($(this).prop('href'))) || (/dai\.ly\//.test($(this).prop('href')))) }).one('mouseover', function() {
            var link = $(this);
            var href = this.href;
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            const re1 = /dailymotion\.com(?:\/embed)?\/video\/([^\/\?]{1,})/;   // video id (e.g. x8994nm)
            var m = href.match(re1);
            if (m == undefined) {
                const re2 = /dai\.ly\/(.*)/;   // video id (e.g. x4v3maz)
                m = href.match(re2);
            }
            if (m == undefined) return;
            let videoId = m[1];

            // reuse previous result
            if (link.data().hoverZoomDailyMotionVideoId == videoId) {
                if (link.data().hoverZoomDailyMotionVideoUrl) link.data().hoverZoomSrc = [link.data().hoverZoomDailyMotionVideoUrl];
                return;
            }

            link.data().hoverZoomDailyMotionVideoId = videoId;
            link.data().hoverZoomDailyMotionVideoUrl = undefined;

            // clean previous result
            link.data().hoverZoomSrc = [];
            getVideoFromAPI(videoId, link);
        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        function getVideoFromAPI(videoId, link) {
            chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:'https://www.dailymotion.com/player/metadata/video/' + videoId,
                                        headers:[{"header":"Content-Type","value":"application/json"}]},
                                        function (response) {
                                            try {
                                                let j = JSON.parse(response);
                                                let videoUrl = j.qualities.auto[0].url;
                                                if (videoUrl) {
                                                    link.data().hoverZoomDailyMotionVideoUrl = videoUrl;
                                                    link.data().hoverZoomSrc = [videoUrl];
                                                    callback(link, name);
                                                    // Image or video is displayed iff the cursor is still over the link
                                                    if (link.data().hoverZoomMouseOver)
                                                        hoverZoom.displayPicFromElement(link);
                                                }
                                            } catch {}
                                        });
        }

        function getVideosFromAPI(videoId, link, nb, idx) {
            chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:'https://www.dailymotion.com/player/metadata/video/' + videoId,
                                        headers:[{"header":"Content-Type","value":"application/json"}]},
                                        function (response) {
                                            try {
                                                let j = JSON.parse(response);
                                                let videoUrl = j.qualities.auto[0].url;
                                                if (videoUrl) {
                                                    link.data().hoverZoomDailyMotionPlaylistUrls.push({'videoUrl':videoUrl, 'idx':idx});
                                                    if (link.data().hoverZoomDailyMotionPlaylistUrls.length == nb) {
                                                        // sort urls
                                                        link.data().hoverZoomDailyMotionPlaylistUrls = link.data().hoverZoomDailyMotionPlaylistUrls.sort(function(a,b) { if (parseInt(a.idx) < parseInt(b.idx)) return -1; return 1;}).map(o => [o.videoUrl]);
                                                        link.data().hoverZoomGallerySrc = link.data().hoverZoomDailyMotionPlaylistUrls;
                                                        link.data().hoverZoomSrc = undefined;
                                                        link.addClass('hoverZoomLinkFromPlugIn');
                                                        callback(link, name);
                                                        // Image or video is displayed iff the cursor is still over the link
                                                        if (link.data().hoverZoomMouseOver)
                                                            hoverZoom.displayPicFromElement(link);
                                                    }
                                                }
                                            } catch {}
                                        });
        }
    }
});