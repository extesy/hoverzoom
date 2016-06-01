var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Dribbble',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        $('img[src*="_teaser."]').each(function () {
            var img = $(this),
                aZoom = img.parents('a.zoom'),
                aOver = img.parents('.dribbble-img').find('a.dribbble-over'),
                link = aOver.length ? aOver : aZoom;
            if (link.length) {
                link.data().hoverZoomSrc = [img.attr('src').replace('_teaser', '')];
                res.push(link);
            }
        });
        callback($(res));
    }
});