var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'GitHub',
    prepareImgLinks:function (callback) {
        var res = [];
        $('a > img[data-canonical-src]').each(function () {
            var img = $(this);
            img.data('hoverZoomSrc', [img.attr('data-canonical-src')]);
            img.data('hoverZoomCaption', [img.attr('alt')]);
            res.push(img);
        });
        hoverZoom.urlReplace(res,
            'a[href*="/blob/"]',
            /\/github.com\/(.*)\/blob\/(.*\.(jpg|png|gif))/,
            '/raw.githubusercontent.com/$1/$2'
        );
        callback($(res));
    }
});
