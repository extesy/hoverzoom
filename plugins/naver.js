var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'naver',
    version:'0.1',
    prepareImgLinks:function (callback) {
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
        // sample:   https://tv.naver.com/v/22717975/list/67096
        // fullsize: https://naver-tvchosun-h.smartmediarep.com/smc/naver/multi/eng/CS1_579016/2f747663686f73756e2f4353322f323032315f707265766965772f656e7465722f433230323130303131375f636c69702f433230323130303131375f636c69705f32303231303933305f32725f31375f7433352e6d7034/0-0-0/content.mp4?solexpire=1633144137&solpathlen=212&soltoken=1b46a469e89697b80c727e5c742fb418&soltokenrule=c29sZXhwaXJlfHNvbHBhdGhsZW58c29sdXVpZA==&soluriver=2&soluuid=9bc4d4bc-a739-49c0-92af-c9c2eb6fa01d&itemtypeid=35&tid=none

        $('a[href]:not(.hoverZoomMouseover)').filter(function() { return (/\/v\/\d+/.test(this.href)) }).addClass('hoverZoomMouseover').one('mouseover', function() {

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
        });

        // videos
        $('a[href*="/vod/"]:not(.hoverZoomMouseover), a[href*="/video?"]:not(.hoverZoomMouseover)').addClass('hoverZoomMouseover').one('mouseover', function() {

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
        });

        // MOVIE
        // sample:   https://ssl.pstatic.net/imgmovie/multimedia/MOVIECLIP/TRAILER/50519_20210923043116.jpg
        // fullsize: https://a01-g-naver-vod.pstatic.net/navertv/c/read/v2/VOD_ALPHA/navertv_2021_09_23_655/a1852e80-1c3f-11ec-9639-5ebafcba569f.mp4?__gda__=1633722213_1e76907f42a167a726a85c4382e87879
        $('img[src]:not(.hoverZoomMouseover)').filter(function() { return (/\/\d+_\d+\./.test(this.src)) }).addClass('hoverZoomMouseover').one('mouseover', function() {

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
        });

        if (res.length) {
            callback($(res), this.name);
        }
    }
});
