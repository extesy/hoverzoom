var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'naver',
    version:'0.2',
    favicon:'naver.ico',
    prepareImgLinks:function (callback) {
        const name = this.name;
        var res = [];

        // sample:   https://search.pstatic.net/sunny/?src=https%3A%2F%2Fimage.cnbcfm.com%2Fapi%2Fv1%2Fimage%2F105721511-1549465637499hess.jpg%3Fv%3D1549465603&type=a340
        // original: https://image.cnbcfm.com/api/v1/image/105721511-1549465637499hess.jpg
        $('img[src*="?src="], [style*=url]').each(function () {

            // if no <a> available then use <img> as link
            let link = $(this).parents('a')[0];
            if (link == undefined) link = this;
            else {
                if ($(link).hasClass('hoverZoomLinkFromPlugIn')) return;
            }
            link = $(link);

            // extract src from image or background-image
            let src = '';
            if (this.src != undefined) {
                src = this.src;
            } else {
                let backgroundImage = this.style.backgroundImage;
                reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
                backgroundImage = backgroundImage.replace(reUrl, '$1');
                src = backgroundImage.replace(/^['"]/, '').replace(/['"]+$/, ''); // remove leading & trailing quotes
            }

            // decode ASCII characters, for instance: '%2C' -> ','
            // NB: this operation must be try/catched because url might not be well-formed
            try {
                src = decodeURIComponent(src).replace(/"/g, '');
            } catch {}
            let m = src.match(/.*\?src=([^&#?]{1,})/);
            if (m == null) return;
            let fullsizeUrl = m[1];
            if (fullsizeUrl != src) {
                if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                    link.data().hoverZoomSrc.unshift(fullsizeUrl);
                    res.push(link);
                }
            }
        });

        // sample:   https://blogthumb.pstatic.net/MjAyMTA5MDFfMTM5/MDAxNjMwNDk3OTk1MjMz.a_2eseioEc2enutvsCS29MZjb_s-0n0Hwc19x1CyvuQg.zxSUpOyPSo4XuTqlKdVajzvC_Aii7G4ZhKa_l99PK94g.JPEG.qp281739/IMG_1871.jpg?type=s3
        // original: https://blogfiles.pstatic.net/MjAyMTA5MDFfMTM5/MDAxNjMwNDk3OTk1MjMz.a_2eseioEc2enutvsCS29MZjb_s-0n0Hwc19x1CyvuQg.zxSUpOyPSo4XuTqlKdVajzvC_Aii7G4ZhKa_l99PK94g.JPEG.qp281739/IMG_1871.jpg
        $('img[src]:not([src*="?src="]), [style*=url]').each(function () {

            // if no <a> available then use <img> as link
            let link = $(this).parents('a')[0];
            if (link == undefined) link = this;
            else {
                if ($(link).hasClass('hoverZoomLinkFromPlugIn')) return;
            }
            link = $(link);

            // extract src from image or background-image
            let src = '';
            if (this.src != undefined) {
                src = this.src;
            } else {
                let backgroundImage = this.style.backgroundImage;
                reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
                backgroundImage = backgroundImage.replace(reUrl, '$1');
                src = backgroundImage.replace(/^['"]/, '').replace(/['"]+$/, ''); // remove leading & trailing quotes
            }

            src = src.replace(/(blogthumb|postfiles)/, 'blogfiles');
            let m = src.match(/(.*?)([^&#?]{1,})/);
            if (m == null) return;
            let fullsizeUrl = m[0];
            if (fullsizeUrl != src) {
                if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                    link.data().hoverZoomSrc.unshift(fullsizeUrl);
                    res.push(link);
                }
            }
        });

        function sortResults(obj, prop1, prop2, asc) {
            obj.sort(function(a, b) {
                if (asc) {
                    return (a[prop1][prop2] > b[prop1][prop2]) ? 1 : ((a[prop1][prop2] < b[prop1][prop2]) ? -1 : 0);
                } else {
                    return (b[prop1][prop2] > a[prop1][prop2]) ? 1 : ((b[prop1][prop2] < a[prop1][prop2]) ? -1 : 0);
                }
            });
        }

        // TV
        // sample: https://tv.naver.com/watch/ELt-oy2EJ8fJ?playlistNo=895649
        // sample: https://tv.naver.com/v/22717975/list/67096
        // fullsize: https://naver-tvchosun-h.smartmediarep.com/smc/naver/multi/eng/CS1_579016/2f747663686f73756e2f4353322f323032315f707265766965772f656e7465722f433230323130303131375f636c69702f433230323130303131375f636c69705f32303231303933305f32725f31375f7433352e6d7034/0-0-0/content.mp4?solexpire=1633144137&solpathlen=212&soltoken=1b46a469e89697b80c727e5c742fb418&soltokenrule=c29sZXhwaXJlfHNvbHBhdGhsZW58c29sdXVpZA==&soluriver=2&soluuid=9bc4d4bc-a739-49c0-92af-c9c2eb6fa01d&itemtypeid=35&tid=none
        $('a[href]').filter(function() { return ( /\/v\/\d+/.test(this.href) || /\/watch\//.test(this.href) ) }).one('mouseover', function() {
            var link = $(this);
            var href = this.href;
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            hoverZoom.prepareFromDocument($(this), this.href, function(doc, callback) {

                let innerHTML = doc.documentElement.innerHTML;

                let m1 = innerHTML.match(/\"videoId\"\s*:\s*\"(.*?)\"/);
                if (m1 == null) callback('');
                let m2 = innerHTML.match(/\"inKey\"\s*:\s*\"(.*?)\"/);
                if (m2 == null) callback('');

                let videoId = m1[1];
                let inKey = m2[1];

                // API call
                let requestUrl = 'https://apis.naver.com/rmcnmv/rmcnmv/vod/play/v2.0/' + videoId + '?key=' + inKey;

                // WARNING: CORB error (Cross-Origin Read Blocking) when calling the API from the content script.
                // cf https://www.chromium.org/Home/chromium-security/extension-content-script-fetches
                // Workaround: call the API from background page.
                chrome.runtime.sendMessage({action:'ajaxGet', url:requestUrl}, function (response) {

                    if (response == null) { callback(''); }

                    try {
                        let data = JSON.parse(response);
                        if (data == null) callback('');
                        let videos = data.videos;
                        if (videos == null) callback('');
                        let list = videos.list;
                        if (list == null || list.length == 0) callback('');

                        // select best quality video & audio sources available
                        sortResults(list, 'encodingOption', 'width', false);
                        let source = list[0].source;
                        callback(source + '.video');
                    } catch { callback(''); }
                });

            }, true); // get source async
        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // VIDEOS ON DEMAND
        $('a[href*="/vod/"], a[href*="/video?"]').one('mouseover', function() {
            var link = $(this);
            var href = this.href;
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            hoverZoom.prepareFromDocument($(this), this.href, function(doc, callback) {

                let innerHTML = doc.documentElement.innerHTML;

                let m1 = innerHTML.match(/masterVideoId\s*:\s*\'(.*?)\'/);
                if (m1 == null) {
                    callback('');
                }
                let m2 = innerHTML.match(/videoKey\s*:\s*\'(.*?)\'/);
                if (m2 == null) {
                    callback('');
                }

                let videoId = m1[1];
                let inKey = m2[1];

                // API call
                let requestUrl = 'https://apis.naver.com/rmcnmv/rmcnmv/vod/play/v2.0/' + videoId + '?key=' + inKey;

                // still no url found so proceed with API call
                // WARNING: CORB error (Cross-Origin Read Blocking) when calling the API from the content script.
                // cf https://www.chromium.org/Home/chromium-security/extension-content-script-fetches
                // Workaround: call the API from background page.
                chrome.runtime.sendMessage({action:'ajaxGet', url:requestUrl}, function (response) {

                    if (response == null) { callback(''); }

                    try {
                        let data = JSON.parse(response);
                        if (data == null) callback('');
                        let videos = data.videos;
                        if (videos == null) callback('');
                        let list = videos.list;
                        if (list == null || list.length == 0) callback('');

                        // select best quality video & audio sources available
                        sortResults(list, 'encodingOption', 'width', false);
                        let source = list[0].source;
                        callback(source + '.video');
                    } catch { callback(''); }
                });

            }, true); // get source async
        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // MOVIE
        // sample:   https://ssl.pstatic.net/imgmovie/multimedia/MOVIECLIP/TRAILER/50519_20210923043116.jpg
        // fullsize: https://a01-g-naver-vod.pstatic.net/navertv/c/read/v2/VOD_ALPHA/navertv_2021_09_23_655/a1852e80-1c3f-11ec-9639-5ebafcba569f.mp4?__gda__=1633722213_1e76907f42a167a726a85c4382e87879
        $('img[src]').filter(function() { return (/\/\d+_\d+\./.test(this.src)) }).one('mouseover', function() {
            var link = $(this);
            var href = this.href;
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            // if no <a> available then use <img> as link
            var link = $(this).parents('a')[0];
            if (link == undefined) link = this;
            link = $(link);

            let m = this.src.match(/\/(\d+)_\d+\./);
            if (m == null) return;

            let videoId = m[1];

            // 1st API call
            let requestUrl = 'https://movie.naver.com/movie/bi/mi/videoInfoJson.naver?mid=' + videoId;

            // still no url found so proceed with API call
            // WARNING: CORB error (Cross-Origin Read Blocking) when calling the API from the content script.
            // cf https://www.chromium.org/Home/chromium-security/extension-content-script-fetches
            // Workaround: call the API from background page.
            chrome.runtime.sendMessage({action:'ajaxGet', url:requestUrl}, function (response) {

                if (response == null) return;

                try {
                    let data = JSON.parse(response);
                    if (data == null) return;
                    let inKey = data.videoInKey;
                    if (inKey == null) return;
                    let videoId = data.videoId;
                    if (videoId == null) return;

                    // 2nd API call
                    let requestUrl = 'https://apis.naver.com/rmcnmv/rmcnmv/vod/play/v2.0/' + videoId + '?key=' + inKey;

                    // still no url found so proceed with API call
                    // WARNING: CORB error (Cross-Origin Read Blocking) when calling the API from the content script.
                    // cf https://www.chromium.org/Home/chromium-security/extension-content-script-fetches
                    // Workaround: call the API from background page.
                    chrome.runtime.sendMessage({action:'ajaxGet', url:requestUrl}, function (response) {

                        if (response == null) { callback(''); }

                        try {
                            let data = JSON.parse(response);
                            if (data == null) callback('');
                            let videos = data.videos;
                            if (videos == null) callback('');
                            let list = videos.list;
                            if (list == null || list.length == 0) callback('');

                            // select best quality video & audio sources available
                            sortResults(list, 'encodingOption', 'width', false);
                            let source = list[0].source;

                            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                            if (link.data().hoverZoomSrc.indexOf(source) == -1) {
                                link.data().hoverZoomSrc.unshift(source);
                            }
                            callback(link, name);
                            hoverZoom.displayPicFromElement(link);
                        } catch { return; }
                    });

                } catch { return; }
            });
        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // LIVE
        // sample:   https://chzzk.naver.com/live/dec8d19f0bc4be90a4e8b5d57df9c071
        // API call: https://api.chzzk.naver.com/service/v2/channels/dec8d19f0bc4be90a4e8b5d57df9c071/live-detail
        $('a[href*="/live/"]').one('mouseover', function() {
            var link = $(this);
            var href = this.href;
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            var liveId = undefined;
            let m = href.match(/\/live\/([^\/\?]{1,})/);
            if (m) {
                liveId = m[1];
            }

            if (liveId == undefined) return;

            // reuse previous result
            if (link.data().hoverZoomNaverLiveId == liveId) {
                if (link.data().hoverZoomNaverLiveSrc) {
                    link.data().hoverZoomSrc = [link.data().hoverZoomNaverLiveSrc];
                    link.data().hoverZoomCaption = link.data().hoverZoomNaverLiveCaption;
                }
                return;
            }
            link.data().hoverZoomNaverLiveId = liveId;
            link.data().hoverZoomNaverLiveSrc = undefined;
            link.data().hoverZoomNaverLiveCaption = undefined;

            // API call
            const requestUrl = `https://api.chzzk.naver.com/service/v2/channels/${liveId}/live-detail`
            chrome.runtime.sendMessage({action:'ajaxGet', url:requestUrl}, function (response) {

                if (response == null) return;

                try {
                    const data = JSON.parse(response);
                    if (data == null || data.content == null) return;
                    const livePlaybackJson = data.content.livePlaybackJson;
                    if (livePlaybackJson == null) return;
                    const livePlayback = JSON.parse(livePlaybackJson);
                    const liveUrl = livePlayback.media[0].path;

                    link.data().hoverZoomNaverLiveUrl = liveUrl;
                    link.data().hoverZoomNaverLiveCaption = data.content.liveTitle;
                    link.data().hoverZoomSrc = [liveUrl];
                    link.data().hoverZoomCaption = data.content.liveTitle;

                    callback(link, name);
                    // Image or video is displayed iff the cursor is still over the link
                    if (link.data().hoverZoomMouseOver)
                        hoverZoom.displayPicFromElement(link);
                } catch { }
            });
        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // VIDEOS
        // sample:       https://chzzk.naver.com/video/107958
        // 1st API call: https://api.chzzk.naver.com/service/v2/videos/107958
        // 2nd API call: https://apis.naver.com/neonplayer/vodplay/v1/playback/8FCC25CCBDE2BB2EE9E6141B435665847E88?key=V127e6e7c6d2bd024abdc5369a4ac2fb4d639cc34828f9e6edb40c7ecdb9ebaa6e3c35369a4ac2fb4d639
        $('a[href]').filter(function() { return ( /\/video\/\d+/.test(this.href) ) }).one('mouseover', function() {
            const link = $(this);
            const href = this.href;
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            const m = href.match(/\/video\/(\d+)/);
            if (m == null) return;
            const videoId = m[1];

            // reuse previous result
            if (link.data().hoverZoomNaverVideoId == videoId) {
                if (link.data().hoverZoomNaverVideoUrl) link.data().hoverZoomSrc = [link.data().hoverZoomNaverVideoUrl];
                return;
            }

            link.data().hoverZoomNaverVideoId = videoId;
            link.data().hoverZoomNaverVideoUrl = undefined;

            // clean previous result
            link.data().hoverZoomSrc = [];

            // API call
            const requestUrl1 = `https://api.chzzk.naver.com/service/v2/videos/${videoId}`;

            chrome.runtime.sendMessage({action:'ajaxGet', url:requestUrl1}, function (response) {
                if (response == null) { return; }
                try {
                    const j1 = JSON.parse(response);
                    const videoIdEx = j1.content.videoId;
                    const inKey = j1.content.inKey;
                    const requestUrl2 = `https://apis.naver.com/neonplayer/vodplay/v1/playback/${videoIdEx}?key=${inKey}`;

                    chrome.runtime.sendMessage({action:'ajaxGet', url:requestUrl2}, function (response) {
                        if (response == null) { return; }
                        try {
                            const j2 = JSON.parse(response);
                            let urlMp4 = undefined;
                            let urlM3u8 = undefined;
                            const representation = hoverZoom.getKeysInJsonObject(j2, "representation", false);
                            representation.forEach(function(r) {
                                r.value.sort(function(a,b) { return (a.width > b.width) ? -1 : ((a.width < b.width) ? 1 : 0) });
                                const baseURL = r.value[0].baseURL[0]?.value;
                                const m3u = r.value[0].otherAttributes?.m3u;
                                if (baseURL.indexOf(".mp4") != -1) urlMp4 = baseURL;
                                else if (m3u.indexOf(".m3u8") != -1) urlM3u8 = m3u;
                            });

                            const bestUrl = urlMp4 ? urlMp4 : urlM3u8;

                            if (bestUrl) {
                                link.data().hoverZoomSrc = [bestUrl];
                                link.data().hoverZoomNaverVideoUrl = bestUrl;
                                callback(link, name);
                                // Image is displayed iff the cursor is still over the link
                                if (link.data().hoverZoomMouseOver)
                                    hoverZoom.displayPicFromElement(link);
                            }
                        } catch {}
                    });

                } catch {}
            });

        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        if (res.length) {
            callback($(res), this.name);
        }
    }
});
