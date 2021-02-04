var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'escapistmagazine',
    version:'0.2',
    prepareImgLinks: function(callback) {
        var res = [];

        $('a[href*="gallery"] img').each(function() {
            var img = $(this),
                link = img.parents('a:eq(0)'),
                src = img.attr('src');
            var regExp = /\/(\d+)\.jpg/;
            var matches = regExp.exec(src);
            src = src.replace(matches[0], "/" + (parseInt(matches[1]) - 1) + ".jpg");

            link.data('hoverZoomSrc', [src]);
            res.push(link);
        });

        //sample url: https://cache.escapistmagazine.com/2020/04/ffviir-800x450.jpg
        // -800x450.jpg -> .jpg
        var reNxN = /-\d+[xX]\d+\./;
        hoverZoom.urlReplace(res,
            'img[src]',
            reNxN,
            '.'
        );

        //avatars
        hoverZoom.urlReplace(res,
            'img[src]',
            /\/avatars\/[sml]\//,
            '/avatars/o/'
        );

        callback($(res), this.name);
    }
});
