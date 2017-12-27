var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: '9gag',
    version: '0.1',
    prepareImgLinks: function(callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src^="https://accounts-cdn.9gag.com/"]',
            /^(.*)_100_(\d+)\.([a-z]+)$/,
            '$1_800_$2.$3'
        );
        callback($(res));
    }
});
