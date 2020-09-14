var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'Zhihu',
    version:'1.1',
    prepareImgLinks: function(callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src*="zhimg.com"]',
            /_(m|s|is)/,
            '_l'
        );

        // image_xs.jpg -> image.jpg
        hoverZoom.urlReplace(res,
            'img[src]',
            /_[a-z]{1,}\./,
            '.'
        );

        // image_123x456.jpg -> image.jpg
        hoverZoom.urlReplace(res,
            'img[src]',
            /_\d+x\d+\./,
            '.'
        );

        callback($(res), this.name);
    }
});
