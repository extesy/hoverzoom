var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Letterboxd',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        $('.poster .image').each(function () {
            var elem = $(this);

            var url = elem.attr('src') || hoverZoom.getThumbUrl(this);
            url = url.replace(/-0-\d+-0-\d+-crop.jpg/, options.showHighRes ? '-0-1000-0-1500-crop.jpg' : '-0-500-0-750-crop.jpg');

            var target = elem.parent('div');
            if (target.length > 0) elem = $(target[0]);

            elem.data().hoverZoomSrc = [url];
            res.push(elem);
        });
        callback($(res));
    }
});
