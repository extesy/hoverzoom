var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'bilibili_a',
    version: '0.5',
    prepareImgLinks: function(callback) {
        var res = [];

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

        function sortResults(obj, prop, asc) {
            obj.sort(function(a, b) {
                if (asc) {
                    return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
                } else {
                    return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
                }
            });
        }

        function processResponse(response, link) {
            try {
                var j = JSON.parse(response);
                var videos = j.data.playurl.video.filter(v => v.video_resource.url != '') || [];
                var audios = j.data.playurl.audio_resource.filter(a => a.url != '') || [];

                if (videos.length == 0) return; // nothing to display
                videos = videos.map(v => v.video_resource);

                // select best quality video & audio among available sources
                sortResults(videos, 'bandwidth', false);
                var videoUrl = videos[0].url + '.video';
                var audioUrl = undefined;
                if (audios.length) { sortResults(audios, 'bandwidth', false); audioUrl = audios[0].url + '.audio'; }
                var fullsizeUrl = (audioUrl == undefined ? videoUrl : videoUrl + '_' + audioUrl);

                if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                    link.data().hoverZoomSrc.unshift(fullsizeUrl);
                    link.data().hoverZoomBilibiliVideoUrl = fullsizeUrl;
                }
                callback(link, name);
                hoverZoom.displayPicFromElement(link);
            } catch {}
        }
        // bilibili.com : videos
        // sample: https://www.bilibili.com/video/BV1u3411M7Ur?spm_id_from=333.851.b_7265636f6d6d656e64.3
        // "video":[{"id":80,"baseUrl":"https://upos-hz-mirrorakam.akamaized.net/upgcxcode/14/67/321656714/321656714_nb2-1-30080.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&uipk=5&nbs=1&deadline=1617971957&gen=playurlv2&os=akam&oi=1487115333&trid=efd5309bdd414ac0bf83bf6bfcb2a05du&platform=pc&upsig=32e8b928abdc2d0a4847c6d910adc8b0&uparams=e,uipk,nbs,deadline,gen,os,oi,trid,platform&hdnts=exp=1617971957~hmac=cc60163fb0de370464ee211b7d086e51168b0f9f87216a6a25e5fd78b8dfe8e9&mid=0&orderid=0,1&agrr=0&logo=80000000","base_url":"https://upos-hz-mirrorakam.akamaized.net/upgcxcode/14/67/321656714/321656714_nb2-1-30080.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&uipk=5&nbs=1&deadline=1617971957&gen=playurlv2&os=akam&oi=1487115333&trid=efd5309bdd414ac0bf83bf6bfcb2a05du&platform=pc&upsig=32e8b928abdc2d0a4847c6d910adc8b0&uparams=e,uipk,nbs,deadline,gen,os,oi,trid,platform&hdnts=exp=1617971957~hmac=cc60163fb0de370464ee211b7d086e51168b0f9f87216a6a25e5fd78b8dfe8e9&mid=0&orderid=0,1&agrr=0&logo=80000000","backupUrl":null,"backup_url":null,"bandwidth":2352549,"mimeType":"video/mp4","mime_type":"video/mp4","codecs":"avc1.640032","width":1920,"height":1080,"frameRate":"16000/656","frame_rate":"16000/656","sar":"1:1","startWithSap":1,"start_with_sap":1,"SegmentBase":{"Initialization":"0-977","indexRange":"978-1321"},"segment_base":{"initialization":"0-977","index_range":"978-1321"},"codecid":7}
        // -> https://upos-hz-mirrorakam.akamaized.net/upgcxcode/14/67/321656714/321656714_nb2-1-30080.m4s?...
        // "audio":[{"id":30280,"baseUrl":"https://upos-hz-mirrorakam.akamaized.net/upgcxcode/14/67/321656714/321656714_nb2-1-30280.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&uipk=5&nbs=1&deadline=1617971957&gen=playurlv2&os=akam&oi=1487115333&trid=efd5309bdd414ac0bf83bf6bfcb2a05du&platform=pc&upsig=fdb703357347ffd714b1d81bf03f6093&uparams=e,uipk,nbs,deadline,gen,os,oi,trid,platform&hdnts=exp=1617971957~hmac=edc49f4b8f625a4cdb51d2a6ee90d2cb469c6773ec20be4c221b52d65c949042&mid=0&orderid=0,1&agrr=0&logo=80000000","base_url":"https://upos-hz-mirrorakam.akamaized.net/upgcxcode/14/67/321656714/321656714_nb2-1-30280.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&uipk=5&nbs=1&deadline=1617971957&gen=playurlv2&os=akam&oi=1487115333&trid=efd5309bdd414ac0bf83bf6bfcb2a05du&platform=pc&upsig=fdb703357347ffd714b1d81bf03f6093&uparams=e,uipk,nbs,deadline,gen,os,oi,trid,platform&hdnts=exp=1617971957~hmac=edc49f4b8f625a4cdb51d2a6ee90d2cb469c6773ec20be4c221b52d65c949042&mid=0&orderid=0,1&agrr=0&logo=80000000","backupUrl":null,"backup_url":null,"bandwidth":319173,"mimeType":"audio/mp4","mime_type":"audio/mp4","codecs":"mp4a.40.2","width":0,"height":0,"frameRate":"","frame_rate":"","sar":"","startWithSap":0,"start_with_sap":0,"SegmentBase":{"Initialization":"0-907","indexRange":"908-1263"},"segment_base":{"initialization":"0-907","index_range":"908-1263"},"codecid":0}
        // -> https://upos-hz-mirrorakam.akamaized.net/upgcxcode/14/67/321656714/321656714_nb2-1-30280.m4s?...

        $('a[href*="/video/"]:not(.hoverZoomMouseover)').filter(function() { return (/bilibili\.com\/video\//.test($(this).prop('href'))) }).addClass('hoverZoomMouseover').one('mouseover', function() {
            hoverZoom.prepareFromDocument($(this), this.href, function(doc, callback) {

                let innerHTML = doc.documentElement.innerHTML;

                // video and audio sources are sometimes stored in document, so no API call is needed
                let token1 = '<script>window.__playinfo__={';
                let index1 = innerHTML.indexOf(token1);
                if (index1 != -1) {
                    let token2 = '}</script>';
                    let index2 = innerHTML.indexOf(token2, index1);
                    let playinfo = innerHTML.substring(index1 + token1.length - 1, index2 + 1);
                    try {
                        let j = JSON.parse(playinfo);
                        let videos = j.data.dash.video || [];
                        let audios = j.data.dash.audio || [];

                        if (videos.length != 0) {
                            // select best quality video & audio sources available
                            sortResults(videos, 'bandwidth', false);
                            let videoUrl = videos[0].baseUrl + '.video';
                            let audioUrl = undefined;
                            if (audios.length) { sortResults(audios, 'bandwidth', false); audioUrl = audios[0].baseUrl + '.audio'; }
                            callback(audioUrl == undefined ? videoUrl : videoUrl + '_' + audioUrl);
                        }

                    } catch {}
                }

                // no source found in document so prepare API call
                token1 = 'window.__INITIAL_STATE__={';
                index1 = innerHTML.indexOf(token1);
                if (index1 == -1) callback('');
                token2 = '};';
                index2 = innerHTML.indexOf(token2, index1);
                let initialState = innerHTML.substring(index1 + token1.length - 1, index2 + 1);
                try {
                    let j = JSON.parse(initialState);
                    let cid = j.videoData.cid;
                    let bvid = j.videoData.bvid;
                    let fnval = getCookie('CURRENT_FNVAL') || 976;
                    if (cid == undefined || bvid == undefined) callback('');

                    // API call
                    let requestUrl = 'https://api.bilibili.com/x/player/playurl?cid=' + cid + '&bvid=' + bvid + '&fnval=' + fnval;

                    // WARNING: CORB error (Cross-Origin Read Blocking) when calling the API from the content script.
                    // cf https://www.chromium.org/Home/chromium-security/extension-content-script-fetches
                    // Workaround: call the API from background page.
                    chrome.runtime.sendMessage({action:'ajaxGet', url:requestUrl}, function (response) {

                        if (response == null) { callback(''); }

                        try {
                            var j = JSON.parse(response);
                            var videos = j.data.dash.video || [];
                            var audios = j.data.dash.audio || [];

                            if (videos.length == 0) callback(''); // nothing to display

                            // select best quality video & audio sources available
                            sortResults(videos, 'bandwidth', false);
                            var videoUrl = videos[0].baseUrl + '.video';
                            var audioUrl = undefined;
                            if (audios.length) { sortResults(audios, 'bandwidth', false); audioUrl = audios[0].baseUrl + '.audio'; }
                            callback(audioUrl == undefined ? videoUrl : videoUrl + '_' + audioUrl);

                        } catch { callback(''); }
                    });

                } catch {}
                callback('');;

            }, true); // get source async
        });

        // bilibili.com : episodes
        // sample: https://www.bilibili.com/bangumi/play/ep508694?spm_id_from=333.1007.partition_recommend.content.click
        $('a[href*="/play/"]').filter(function() { return (/bilibili\.com\/.*\/play\/ep\d+/.test($(this).prop('href'))) }).on('mouseover', function() {

            var link = undefined;
            var href = undefined;

            href = this.href;
            link = $(this);

            const re = /bilibili\.com\/.*\/play\/ep(\d+)/;   // episode id (e.g. 508694)
            m = href.match(re);
            if (m == undefined) return;
            let episodeId = m[1];

            // reuse previous result
            if (link.data().hoverZoomBilibiliVideoId == episodeId) {
                if (link.data().hoverZoomBilibiliVideoUrl) link.data().hoverZoomSrc = [link.data().hoverZoomBilibiliVideoUrl];
                return;
            }

            link.data().hoverZoomBilibiliVideoId = episodeId;
            link.data().hoverZoomBilibiliVideoUrl = undefined;

            // clean previous result
            link.data().hoverZoomSrc = [];

            // API call
            //let requestUrl = 'https://api.bilibili.com/pugv/player/web/playurl?fnval=16&ep_id=' + episodeId;
            let requestUrl = 'https://api.bilibili.com/pgc/player/web/playurl?fnval=4048&ep_id=' + episodeId;

            // WARNING: CORB error (Cross-Origin Read Blocking) when calling the API from the content script.
            // cf https://www.chromium.org/Home/chromium-security/extension-content-script-fetches
            // Workaround: call the API from background page.
            chrome.runtime.sendMessage({action:'ajaxGet', url:requestUrl}, function (response) {

                if (response == null) return;

                try {
                    var j = JSON.parse(response);
                    var videos = j.result.dash.video || [];
                    var audios = j.result.dash.audio || [];

                    if (videos.length == 0) callback(''); // nothing to display

                    // select best quality video & audio sources available
                    sortResults(videos, 'bandwidth', false);
                    var videoUrl = videos[0].baseUrl + '.video';
                    var audioUrl = undefined;
                    if (audios.length) { sortResults(audios, 'bandwidth', false); audioUrl = audios[0].baseUrl + '.audio'; }

                    var fullsizeUrl = (audioUrl == undefined ? videoUrl : videoUrl + '_' + audioUrl);

                    if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                    if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                        link.data().hoverZoomSrc.unshift(fullsizeUrl);
                        link.data().hoverZoomBilibiliVideoUrl = fullsizeUrl;
                    }
                    callback(link, name);
                    hoverZoom.displayPicFromElement(link);
                } catch { }
            });
        });

        // bilibili.tv : series
        // samples: https://www.bilibili.tv/th/play/1046192/11165556
        //          https://www.bilibili.tv/play/35087
        $('a[href*="/play/"]').filter(function() { return (/bilibili\.tv.*\/play\/\d+\/\d+/.test($(this).prop('href'))) }).on('mouseover', function() {

            var link = undefined;
            var href = undefined;

            href = this.href;
            link = $(this);

            const re = /bilibili\.tv.*\/play\/\d+\/(\d+)/;   // episode id (e.g. 11165556)
            m = href.match(re);
            if (m == undefined) return;
            let episodeId = m[1];

            // reuse previous result
            if (link.data().hoverZoomBilibiliVideoId == episodeId) {
                if (link.data().hoverZoomBilibiliVideoUrl) link.data().hoverZoomSrc = [link.data().hoverZoomBilibiliVideoUrl];
                return;
            }

            link.data().hoverZoomBilibiliVideoId = episodeId;
            link.data().hoverZoomBilibiliVideoUrl = undefined;

            // clean previous result
            link.data().hoverZoomSrc = [];
            chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:'https://api.bilibili.tv/intl/gateway/web/playurl?platform=web&ep_id=' + episodeId,
                                        headers:[{"header":"Content-Type","value":"application/json"}]},
                                        function (response) { processResponse(response, link) });
        });

        // bilibili.tv : videos
        // samples: https://www.bilibili.tv/en/video/2010871582?bstar_from=bstar-web.homepage.ugc.all
        //          https://www.bilibili.tv/video/2049517221
        $('a[href*="/video/"]').filter(function() { return (/bilibili\.tv.*\/video\/\d+/.test($(this).prop('href'))) }).on('mouseover', function() {

            var link = undefined;
            var href = undefined;

            href = this.href;
            link = $(this);

            const re = /bilibili\.tv.*\/video\/(\d+)/;   // video id (e.g. 2010871582)
            m = href.match(re);
            if (m == undefined) return;
            let videoId = m[1];

            // reuse previous result
            if (link.data().hoverZoomBilibiliVideoId == videoId) {
                if (link.data().hoverZoomBilibiliVideoUrl) link.data().hoverZoomSrc = [link.data().hoverZoomBilibiliVideoUrl];
                return;
            }

            link.data().hoverZoomBilibiliVideoId = videoId;
            link.data().hoverZoomBilibiliVideoUrl = undefined;

            // clean previous result
            link.data().hoverZoomSrc = [];
            chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:'https://api.bilibili.tv/intl/gateway/web/playurl?platform=web&aid=' + videoId,
                                        headers:[{"header":"Content-Type","value":"application/json"}]},
                                        function (response) { processResponse(response, link) });
        });

        // zoom every image but video stills
        // sample: https://i2.hdslb.com/bfs/face/3be1bf9e5d555456278f696941bd267632df62e4.jpg@52w_52h.webp
        //      -> https://i2.hdslb.com/bfs/face/3be1bf9e5d555456278f696941bd267632df62e4.jpg
        //         https://pic.bstarstatic.com/face/2b2f580d79875dfeca1ad2902d96073f2698f3bd.jpg@80w_80h_1e_1c_1f.webp
        //      -> https://pic.bstarstatic.com/face/2b2f580d79875dfeca1ad2902d96073f2698f3bd.jpg
        hoverZoom.urlReplace(res,
            'img[src*="hdslb.com"]:not([src*="/archive/"]), img[src*="pic.bstarstatic.com"]', //, [style*="url"]',
            /(.*)@.*/,
            '$1'
        );

        callback($(res), this.name);
    }
});
