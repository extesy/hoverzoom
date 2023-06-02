var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'xhamster_a',
    version: '1.1',
    prepareImgLinks: function(callback) {
        var name = this.name;

        // if header(s) rewrite is allowed store headers settings that will be used for rewrite
        if (options.allowHeadersRewrite) {
            chrome.runtime.sendMessage({action:"storeHeaderSettings",
                                        plugin:name,
                                        settings:
                                            [{"type":"request",
                                            "skipInitiator":"xhamster",
                                            "urls":["xhcdn.com"],
                                            "headers":[{"name":"referer", "value":"https://xhamster.com/", "typeOfUpdate":"add"}]},
                                            {"type":"response",
                                            "skipInitiator":"xhamster",
                                            "urls":["xhcdn.com"],
                                            "headers":[{"name":"Access-Control-Allow-Origin", "value":"*", "typeOfUpdate":"add"}]}]
                                        });
        }

        // lives
        $('a[data-model-id]:not(.hoverZoomMouseover)').filter(function() { return (/(xhamsterlive)/.test($(this).prop('href'))) }).addClass('hoverZoomMouseover').one('mouseover', function() {
            var link = undefined;
            var href = undefined;

            href = this.href;
            link = $(this);

            var modelId = this.dataset.modelId;
            var m3u8 = 'https://b-hls-11.doppiocdn.com/hls/' + modelId + '/master/' + modelId + '.m3u8';
            link.data().hoverZoomSrc = [m3u8];
            callback(link, name);
            hoverZoom.displayPicFromElement(link);
        })

        // lives hosted on xhamsterlive
        // sample: https://img.strpst.com/thumbs/1662125888/68327223
        // live:   https://b-hls-11.doppiocdn.com/hls/68327223/master/68327223.m3u8
        $('div[style*="background-image"]:not(.hoverZoomMouseover)').filter(function() { return (/img.strpst.com\/thumbs\/\d+\/\d+/.test(this.style.backgroundImage)) }).addClass('hoverZoomMouseover').one('mouseover', function() {
            let link = $(this);
            let backgroundImage = this.style.backgroundImage;
            const reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            let url = backgroundImage.replace(/^['"]/, "").replace(/['"]+$/, ""); // remove leading & trailing quotes
            const re = /\/thumbs\/(\d+)\/(\d+)/;   // e.g: model id = 68327223
            var m = url.match(re);
            if (m == undefined) return;
            let modelId = m[2];
            let m3u8 = 'https://b-hls-11.doppiocdn.com/hls/' + modelId + '/master/' + modelId + '.m3u8';
            link.data().hoverZoomSrc = [m3u8];
            callback(link, name);
            hoverZoom.displayPicFromElement(link);
        })

        // images
        // gallery link: https://fr.xhamster.com/photos/gallery/15782182/492238368
        // thumbnail:    https://thumb-p1.xhcdn.com/a/eKLh-_1dEs7Gh4c-95z9JA/000/506/206/131_100.jpg
        // fullsize:     https://thumb-p1.xhcdn.com/a/Fs2HwXOgDcp_KeHnaCm21A/000/506/206/131_1000.jpg
        $('a[href*="/photos/gallery/"]:not(.hoverZoomMouseover)').filter(function() { return (/(xhamster)/.test($(this).prop('href'))) }).addClass('hoverZoomMouseover').one('mouseover', function() {

            var link = undefined;
            var href = undefined;

            href = this.href;
            link = $(this);

            const re = /\/photos\/gallery\/(\d+)\/(\d+)/;   // e.g: gallery id = 15782182   image id = 492238368
            var m = href.match(re);
            if (m == undefined) return;
            let galleryId = m[1];
            let imageId = m[2];

            // search current document for fullsize url
            let fullsizeUrl = undefined;
            if (document.scripts['initials-script']) {
                let initials = document.scripts['initials-script'].text.replace('window.initials={', '{').replace('};', '}');
                try {
                    let j = JSON.parse(initials);
                    let image = j["photosGalleryModel"]['photos']['items'].find(i => i.galleryId == galleryId && i.id == imageId);
                    if (image) {
                        fullsizeUrl = image.imageURL;
                        let data = link.data();
                        data.hoverZoomSrc = [fullsizeUrl];
                        callback(link, name);
                        hoverZoom.displayPicFromElement(link);
                    }
                } catch {}
            }

            if (fullsizeUrl) return;

            // load link to extract fullsize url
            hoverZoom.prepareFromDocument($(this), this.href, function(doc) {
                // search current document for fullsize url
                if (doc.scripts['initials-script']) {
                    let initials = doc.scripts['initials-script'].text.replace('window.initials={', '{').replace('};', '}');
                    try {
                        let j = JSON.parse(initials);
                        let image = j["photosGalleryModel"]['photos']['items'].find(i => i.galleryId == galleryId && i.id == imageId);
                        if (image) {
                            return image.imageURL;
                        }
                    } catch {}
                }
            }, false); // get source sync
        })

        // images hosted on xhamsterlive
        // sample:   https://cdn.strpst.com/cdn/photos/0/3/c/03cacae6b8609a7135b1654bfdd749f5-thumb
        // fullsize: https://cdn.strpst.com/cdn/photos/0/3/c/03cacae6b8609a7135b1654bfdd749f5
        $('li[style*="background-image"]:not(.hoverZoomMouseover)').filter(function() { return (/cdn.strpst.com\/cdn\/photos\/.*-thumb/.test(this.style.backgroundImage)) }).addClass('hoverZoomMouseover').one('mouseover', function() {
            let link = $(this);
            let backgroundImage = this.style.backgroundImage;
            const reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            let fullsize = backgroundImage.replace(/^['"]/, "").replace(/['"]+$/, "").replace("-thumb", ""); // remove leading & trailing quotes
            link.data().hoverZoomSrc = [fullsize];
            callback(link, name);
            hoverZoom.displayPicFromElement(link);
        })

        // videos
        // sample: https://xhamster.com/videos/rhona-mitra-the-life-of-david-gale-915144
        $('a[href*="/videos/"]:not(.hoverZoomMouseover)').filter(function() { return (/(xhamster)/.test($(this).prop('href'))) }).addClass('hoverZoomMouseover').one('mouseover', function() {

            var link = undefined;
            var href = undefined;

            href = this.href;
            link = $(this);

            const re = /\/videos\/([^\/\?]{1,})/;   // video id (e.g. rhona-mitra-the-life-of-david-gale-915144)
            var m = href.match(re);
            if (m == undefined) return;
            let videoId = m[1];

            link.data().hoverZoomCustomReferer = "https://xhamster.com/";

            // clean previous result
            link.data().hoverZoomSrc = [];
            hoverZoom.prepareFromDocument($(this), this.href, function(doc, link) {

                let innerHTML = doc.documentElement.innerHTML;
                let token1 = 'window.initials={';
                let index1 = innerHTML.indexOf(token1);
                if (index1 != -1) {
                    let token2 = '</script>';
                    let index2 = innerHTML.indexOf(token2, index1);
                    let playinfo = innerHTML.substring(index1 + token1.length - 1, index2);
                    playinfo = playinfo.trim().replace(/;$/, '');
                    try {
                        let j = JSON.parse(playinfo);
                        let videoUrl = j["videoModel"]["sources"]["mp4"]["2160p"];
                        if (videoUrl == undefined) videoUrl = j["videoModel"]["sources"]["mp4"]["1080p"];
                        if (videoUrl == undefined) videoUrl = j["videoModel"]["sources"]["mp4"]["720p"];
                        if (videoUrl == undefined) videoUrl = j["videoModel"]["sources"]["mp4"]["480p"];
                        if (videoUrl == undefined) videoUrl = j["videoModel"]["sources"]["mp4"]["240p"];
                        if (videoUrl == undefined) videoUrl = j["videoModel"]["sources"]["mp4"]["144p"];
                        if (videoUrl) {
                            return videoUrl;
                        }
                    } catch {}
                }
            }, false); // get source sync
        })

        // videos hosted on xhamsterlive
        $('div[data-user-id][data-video-id]:not(.hoverZoomMouseover)').addClass('hoverZoomMouseover').one('mouseover', function() {

            var link = $(this);

            var userId = this.dataset.userId;
            var videoId = this.dataset.videoId;
            var url = 'https://xhamsterlive.com/api/front/users/' + userId + '/videos/' + videoId;

            chrome.runtime.sendMessage({action:'ajaxGet', url:url}, function (response) {

                if (response == null) { return; }
                try {
                    let j = JSON.parse(response);
                    var videoUrl = j.video.videoUrl;
                    if (videoUrl) {
                        link.data().hoverZoomSrc = [videoUrl];
                        callback(link, name);
                        hoverZoom.displayPicFromElement(link);
                    }
                } catch {}
            });
        })

    }
});
