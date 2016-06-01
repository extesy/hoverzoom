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
        callback($(res));
    }
});
