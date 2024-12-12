var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'Civit AI',
    version: '1.0',
    prepareImgLinks: function(callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src*="//image.civitai.com/"]',
            /\/width=\d+\//,
            '/original=true,quality=90/'
        );

        callback($(res), this.name);
    }
});
