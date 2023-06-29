var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'kleinanzeigen.de',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        $('.aditem-image img').each(function () {
            var elem = $(this);

            var url = elem.attr('src') || hoverZoom.getThumbUrl(this);
            url = url.replace(/rule=\$_.+.JPG/, 'rule=$_59.JPG');

            var target = elem.parents('a');
            if (target.length > 0) elem = $(target[0]);

            elem.data().hoverZoomSrc = [url];
            res.push(elem);
        });

        

        callback($(res));
    }
});
