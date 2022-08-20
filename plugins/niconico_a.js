var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'niconico_a',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // if header(s) rewrite is allowed store headers settings that will be used for rewrite
        if (options.allowHeadersRewrite) {
             chrome.runtime.sendMessage({action:"storeHeaderSettings",
                                        plugin:name,
                                        settings:
                                            [{"type":"response",
                                            "skipInitiator":"nico",
                                            "url":"dmc.nico",
                                            "headers":[{"name":"Access-Control-Allow-Origin", "value":"*", "typeOfUpdate":"add"}]}]
                                        });
        }

        // images (user must be logged in)
        // page hosting thumbnail img: https://seiga.nicovideo.jp/
        // thumbnail img:              https://lohas.nicoseiga.jp/thumb/10804753q?1630337080
        // fullsize img:               https://lohas.nicoseiga.jp/priv/6fe923d8cddbce9d42ecd163db4c8dad622db3ea/1660470301/10804753
        $('img[src*="nicoseiga.jp/thumb/"]:not(.hoverZoomMouseover), a[href*="/seiga/im"]:not(.hoverZoomMouseover)').filter(function() { if(/nico.*\.jp/.test($(this).prop('src'))) return true; if(/nico.*\.jp/.test($(this).prop('href'))) return true; return false; }).addClass('hoverZoomMouseover').one('mouseover', function() {
            var thumb = this.src || this.href;
            var link = $(this);

            var re = /\/thumb\/(\d+)/;   // image id (e.g. 10804753)
            var m = thumb.match(re);
            if (m == undefined) {
                re = /\/seiga\/im(\d+)/;   // image id (e.g. 10804753)
                m = thumb.match(re);
            }
            if (m == undefined) return;
            let imageId = m[1];

            var sourceLink = 'https://seiga.nicovideo.jp/image/source/' + imageId;

            // clean previous result
            link.data().hoverZoomSrc = [];
            hoverZoom.prepareFromDocument($(this), sourceLink, function(doc, callback) {
                let fullsize = doc.querySelector('div[data-src]');
                if (fullsize) {
                    callback(fullsize.dataset.src);
                    hoverZoom.displayPicFromElement(link);
                }
            }, true); // get source async
        });

        // comics (some comics are protected: displayed as canvas instead of regular imgs)
        // overview: https://seiga.nicovideo.jp/comic/52735?track=verticalwatch_recommend
        // episode:  https://seiga.nicovideo.jp/watch/mg553196?track=ct_episode
        $('a[href*="/watch/mg"]').filter(function() { return (/nicovideo\.jp\/watch\/mg\d+/.test($(this).prop('href'))) }).one('mouseover', function() {
            var episodeLink = this.href;
            var link = $(this);

            // clean previous result
            link.data().hoverZoomSrc = [];
            link.data().hoverZoomGallerySrc = [];
            hoverZoom.prepareFromDocument($(this), episodeLink, function(doc, callback) {
                let episode = doc.querySelectorAll('img[data-original][data-image-id]');
                if (episode) {
                    var gallery = [];
                    $(episode).each(function() {
                        gallery.push([this.dataset.original]);
                    });
                    callback(gallery);
                    hoverZoom.displayPicFromElement(link);
                }
            }, true); // get source async
        });

        // videos
        // sample: https://www.nicovideo.jp/watch/sm38456939
        $('a[href*="/watch/sm"]:not(.hoverZoomMouseover), a[href*="/watch/so"]:not(.hoverZoomMouseover), a[href*="/watch/nm"]:not(.hoverZoomMouseover)').filter(function() { return (/nicovideo\.jp\/\/?watch\/(sm|so|nm)\d+/.test($(this).prop('href'))) }).addClass('hoverZoomMouseover').one('mouseover', function() {
            var videoLink = this.href;
            var link = $(this);

            const re = /\/watch\/(sm|so|nm)(\d+)/;   // video id (e.g. 38456939)
            const m = videoLink.match(re);
            if (m == undefined) return;

            let videoId = m[2];

            // clean previous result
            link.data().hoverZoomSrc = [];
            hoverZoom.prepareFromDocument($(this), videoLink, function(doc, callback) {
                let apiData = doc.querySelectorAll('[data-api-data]');
                if (apiData.length == 0) return;

                apiData = apiData[0].dataset.apiData;
                try {
                    let j = JSON.parse(apiData);
                    let session = j.media.delivery.movie.session;
                    let recipeId = session.recipeId;
                    let playerId = session.playerId;
                    let signature = session.signature;
                    let contentId = session.contentId;
                    let token = JSON.stringify(session.token);
                    let serviceUserId = session.serviceUserId;
                    let videos = JSON.stringify(session.videos);
                    let audios = JSON.stringify(session.audios);
                    let heartbeatLifetime = session.heartbeatLifetime;
                    let contentKeyTimeout = session.contentKeyTimeout;
                    let priority = session.priority;

                    // force segment_duration to 60000
                    let payload = `{"session":{"recipe_id":"${recipeId}","content_id":"${contentId}","content_type":"movie","content_src_id_sets":[{"content_src_ids":[{"src_id_to_mux":{"video_src_ids":${videos},"audio_src_ids":${audios}}}]}],"timing_constraint":"unlimited","keep_method":{"heartbeat":{"lifetime":${heartbeatLifetime}}},"protocol":{"name":"http","parameters":{"http_parameters":{"parameters":{"hls_parameters":{"use_well_known_port":"yes","use_ssl":"yes","transfer_preset":"","segment_duration":60000}}}}},"content_uri":"","session_operation_auth":{"session_operation_auth_by_signature":{"token":${token},"signature":"${signature}"}},"content_auth":{"auth_type":"ht2","content_key_timeout":${contentKeyTimeout},"service_id":"nicovideo","service_user_id":"${serviceUserId}"},"client_info":{"player_id":"${playerId}"},"priority":${priority}}}`;

                    $.ajax({
                        type: 'POST',
                        dataType: 'text',
                        url: 'https://api.dmc.nico/api/sessions?_format=json',
                        data: payload,
                        success: function(response) {
                                try {
                                    response = JSON.parse(response);
                                    let m3u8 = response.data.session.content_uri;
                                    callback(m3u8);
                                    hoverZoom.displayPicFromElement(link);
                                } catch {
                                    return;
                                }
                            },
                        error: function(response) {
                            }
                        });
                } catch {
                    return;
                }
            }, true); // get source async
        });

        callback($(res), this.name);
    }
});
