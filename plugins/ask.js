var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Ask.fm',
    prepareImgLinks:function (callback) {
        var res = [];
        $('a[data-action="ImageOpen"] img, a[style^="background-image"').each(function () {
            var img = $(this),
                src = hoverZoom.getThumbUrl(this);
            src = src.
                replace(/(original)|(thumb_big)|(thumb)|(normal)/, 'large').split('"').join(''); 
            img.data('hoverZoomSrc', [src]);

            res.push(img);
        });
        callback($(res));
    }
});
