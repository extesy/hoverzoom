var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'figma.com',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        $('[class*=generic_tile_thumbnail--thumbnailFullWidth]').each(function () {
            var elem = $(this);

            var url = hoverZoom.getThumbUrl(this);

            var target = elem.parents('a');
            if (target.length > 0) elem = $(target[0]);

            elem.data().hoverZoomSrc = [url];
            res.push(elem);
        });

        callback($(res));
    }
});
