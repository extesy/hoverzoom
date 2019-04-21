var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Yandex',
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
        callback($(res));
    }
});