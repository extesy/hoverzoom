var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'Weibo',
    version: '1.0',
    prepareImgLinks: function(callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src]',
            /\/thumb\d+\//,
            '/large/'
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            /\/(orj|mw)\d+\//,
            '/large/'
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            /\/crop.*\//,
            '/large/'
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            /\/square.*\//,
            '//'
        );

        callback($(res), this.name);
    }
});
