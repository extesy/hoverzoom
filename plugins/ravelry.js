var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Ravelry',
    version:'0.3',
    prepareImgLinks:function (callback) {
        var res = [];
        var repl = '';

        hoverZoom.urlReplace(res,
            'img[src-webp], [style*="url"]',
            /(.*)\/webp\/(.*?)_.*\.(.*)$/,
            '$1/$2.$3'
        );

        hoverZoom.urlReplace(res,
            'img[src]:not([src-webp]), [style*="url"]',
            /_medium2?/,
            repl
        );

        hoverZoom.urlReplace(res,
            'img[src]:not([src-webp]), [style*="url"]',
            ['_small_best_fit', /_small2?/, /_thumbnail2?/, /_square2?/, /_large2?/, '_best_fit', '_tiny', '_banner', '/webp/', '.webp#jpg', '.webp#JPG'],
            [repl, repl, repl, repl, repl, repl, repl, repl, '/', '.jpg', '.JPG']
        );

        hoverZoom.urlReplace(res,
            'img[src]:not([src-webp]), [style*="url"]',
            /_[mst]\./,
            '.'
        );

        callback($(res), this.name);

        // This second processing makes use of the Flickr API to try to get larger pictures.
        if (options.showHighRes) {
            $('a img[src*="static.flickr.com"]').each(function () {
                var _this = $(this),
                    link = _this.parents('a:eq(0)'),
                    src = _this.attr('src');
                hoverZoomPluginFlickerA.prepareImgLinkFromSrc(link, src, callback);
            });
        }
    }
});
