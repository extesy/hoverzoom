var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'bilibili',
    version: '0.2',
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

        // sample:
        // "video":[{"id":80,"baseUrl":"https://upos-hz-mirrorakam.akamaized.net/upgcxcode/14/67/321656714/321656714_nb2-1-30080.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&uipk=5&nbs=1&deadline=1617971957&gen=playurlv2&os=akam&oi=1487115333&trid=efd5309bdd414ac0bf83bf6bfcb2a05du&platform=pc&upsig=32e8b928abdc2d0a4847c6d910adc8b0&uparams=e,uipk,nbs,deadline,gen,os,oi,trid,platform&hdnts=exp=1617971957~hmac=cc60163fb0de370464ee211b7d086e51168b0f9f87216a6a25e5fd78b8dfe8e9&mid=0&orderid=0,1&agrr=0&logo=80000000","base_url":"https://upos-hz-mirrorakam.akamaized.net/upgcxcode/14/67/321656714/321656714_nb2-1-30080.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&uipk=5&nbs=1&deadline=1617971957&gen=playurlv2&os=akam&oi=1487115333&trid=efd5309bdd414ac0bf83bf6bfcb2a05du&platform=pc&upsig=32e8b928abdc2d0a4847c6d910adc8b0&uparams=e,uipk,nbs,deadline,gen,os,oi,trid,platform&hdnts=exp=1617971957~hmac=cc60163fb0de370464ee211b7d086e51168b0f9f87216a6a25e5fd78b8dfe8e9&mid=0&orderid=0,1&agrr=0&logo=80000000","backupUrl":null,"backup_url":null,"bandwidth":2352549,"mimeType":"video/mp4","mime_type":"video/mp4","codecs":"avc1.640032","width":1920,"height":1080,"frameRate":"16000/656","frame_rate":"16000/656","sar":"1:1","startWithSap":1,"start_with_sap":1,"SegmentBase":{"Initialization":"0-977","indexRange":"978-1321"},"segment_base":{"initialization":"0-977","index_range":"978-1321"},"codecid":7}
        // -> https://upos-hz-mirrorakam.akamaized.net/upgcxcode/14/67/321656714/321656714_nb2-1-30080.m4s?...
        // "audio":[{"id":30280,"baseUrl":"https://upos-hz-mirrorakam.akamaized.net/upgcxcode/14/67/321656714/321656714_nb2-1-30280.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&uipk=5&nbs=1&deadline=1617971957&gen=playurlv2&os=akam&oi=1487115333&trid=efd5309bdd414ac0bf83bf6bfcb2a05du&platform=pc&upsig=fdb703357347ffd714b1d81bf03f6093&uparams=e,uipk,nbs,deadline,gen,os,oi,trid,platform&hdnts=exp=1617971957~hmac=edc49f4b8f625a4cdb51d2a6ee90d2cb469c6773ec20be4c221b52d65c949042&mid=0&orderid=0,1&agrr=0&logo=80000000","base_url":"https://upos-hz-mirrorakam.akamaized.net/upgcxcode/14/67/321656714/321656714_nb2-1-30280.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&uipk=5&nbs=1&deadline=1617971957&gen=playurlv2&os=akam&oi=1487115333&trid=efd5309bdd414ac0bf83bf6bfcb2a05du&platform=pc&upsig=fdb703357347ffd714b1d81bf03f6093&uparams=e,uipk,nbs,deadline,gen,os,oi,trid,platform&hdnts=exp=1617971957~hmac=edc49f4b8f625a4cdb51d2a6ee90d2cb469c6773ec20be4c221b52d65c949042&mid=0&orderid=0,1&agrr=0&logo=80000000","backupUrl":null,"backup_url":null,"bandwidth":319173,"mimeType":"audio/mp4","mime_type":"audio/mp4","codecs":"mp4a.40.2","width":0,"height":0,"frameRate":"","frame_rate":"","sar":"","startWithSap":0,"start_with_sap":0,"SegmentBase":{"Initialization":"0-907","indexRange":"908-1263"},"segment_base":{"initialization":"0-907","index_range":"908-1263"},"codecid":0}
        // -> https://upos-hz-mirrorakam.akamaized.net/upgcxcode/14/67/321656714/321656714_nb2-1-30280.m4s?...

        $('a[href*="/video/"]:not(.hoverZoomMouseover)').addClass('hoverZoomMouseover').one('mouseover', function() {
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

        // zoom every image but video stills
        // sample: https://i2.hdslb.com/bfs/face/3be1bf9e5d555456278f696941bd267632df62e4.jpg@52w_52h.webp
        //      -> https://i2.hdslb.com/bfs/face/3be1bf9e5d555456278f696941bd267632df62e4.jpg
        hoverZoom.urlReplace(res,
            'img[src]:not([src*="/archive/"]), [style*="url"]',
            /(.*)@.*/,
            '$1'
        );

        callback($(res), this.name);
    }
});
