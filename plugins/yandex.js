var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Yandex',
    version:'1.1',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'a.z-images__wraplink[href*="img_url="]',
            /.*img_url=([^&]*)(.*)/,
            '$1'
        );

        hoverZoom.urlReplace(res,
            'a img[src*="size="]',
            /[\?&]size=\d+/,
            ''
        );

        hoverZoom.urlReplace(res,
            'img[src*="resize.yandex."]',
            /.*url=([^&]*?).*/,
            '$1',
            'dt'
        );

        $('[onclick*="fitSize"]').each(function() {
            var url = this.getAttribute('onclick');
            if (url = url.match(/fitSize.*?url":"([^"]*)/)) {
                if (url = url[1]) {
                    var link = $(this).find('img');
                    link.data().hoverZoomSrc = [url];
                    res.push(link);
                }
            }
        });

        $('img').each(function() {
            p = $(this).parents('div[data-bem]')[0];
            if (p != undefined) {
                bem = p.dataset.bem;
                if (bem != undefined) {
                    all = [];
                    o = JSON.parse(bem);
                    item = o["serp-item"];
                    if (item != undefined) {
                        preview = item["preview"];
                        if (preview != undefined) { preview.forEach(function(t) { all.push(t)}) }
                        dups = item["dups"];
                        if (dups != undefined) { dups.forEach(function(t) { all.push(t)}) }
                        all.sort(function(a,b) { return b.fileSizeInBytes - a.fileSizeInBytes });
                        //select url with biggest filesize
                        url = all[0].url;
                        var link = $(this);
                        link.data().hoverZoomSrc = [url];
                        res.push(link);
                    }
                }
            }
        });

        // avatars
        // sample : https://avatars.mds.yandex.net/get-yapic/39803/enc-9e2a4aabfacf3d4ec7c780bce466a5e76f0819a1d43f4c2ae68c49e17d896dad/islands-middle
        //       -> https://avatars.mds.yandex.net/get-yapic/39803/enc-9e2a4aabfacf3d4ec7c780bce466a5e76f0819a1d43f4c2ae68c49e17d896dad/orig
        var regex1 = /(.*)\/.*/;
        var patch1 = '$1/orig';

        hoverZoom.urlReplace(res,
            'img[src*="avatars"]',
            regex1,
            patch1
        );

        $('[style*=url]').each(function() {
            let link = $(this);
            // extract url from style
            let backgroundImage = this.style.backgroundImage;
            if (backgroundImage.indexOf("url") == -1) return;
            if (backgroundImage.indexOf("avatars") == -1) return;

            let reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            // remove leading & trailing quotes
            let backgroundImageUrl = backgroundImage.replace(/^['"]/, "").replace(/['"]+$/, "");
            let fullsizeUrl = backgroundImageUrl.replace(regex1, patch1);
            if (fullsizeUrl != backgroundImageUrl) {

                if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                    link.data().hoverZoomSrc.unshift(fullsizeUrl);
                    res.push(link);
                }
            }
        });

        callback($(res), this.name);
    }
});