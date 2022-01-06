var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'Weibo',
    version: '2.0',
    prepareImgLinks: function(callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src]',
            /\/thumb\d+\//,
            '/original/'
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            /\/(orj|mw)\d+\//,
            '/original/'
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            /\/crop.*?\//,
            '/original/'
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            /\/square.*?\//,
            '/original/'
        );

        callback($(res), this.name);
    }
});
