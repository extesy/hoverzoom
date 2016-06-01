var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'IMDb',
    version:'0.5',
    prepareImgLinks:function (callback) {
        var res = [];
        $('img[src*="._V1"], img.loadlate, div.rec_poster_img').each(function () {
            var elem = $(this),
                url = elem.attr('loadlate') || hoverZoom.getThumbUrl(this);
            url = url.replace(/\._V1.*\./, options.showHighRes ? '.' : '._V1._SX600_SY600_.');
            elem.data().hoverZoomSrc = [url];
            res.push(elem);
        });
        callback($(res));
    }
});
