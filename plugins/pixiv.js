var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Pixiv',
    prepareImgLinks:function (callback) {
        var res = [],
            filter = 'a img[src*="pixiv.net/img"]',
            search = [/_(\d+(ms)?|\d+x\d+)\./, '/mobile/'];
        hoverZoom.urlReplace(res, filter, search, ['_m.', '/']);
        if (options.showHighRes) {
            hoverZoom.urlReplace(res, filter, search, ['.', '/']);
        }
        hoverZoom.urlReplace(res, 'a img[src*="pixiv.net/profile/"]', search, ['.', '/']);
        callback($(res));

        $('a[href*="member_illust.php"]').on('mouseover', function() {
            var link = $(this);
            if (link.data().hoverZoomSrc) return;
            hoverZoom.prepareFromDocument($(link), link.attr('href'), function(doc) {
                if (link.data().hoverZoomSrc) return false;
                var img = doc.querySelector('div.works_display img');
                return img ? img.src : false;
            });
        });
    }
});
