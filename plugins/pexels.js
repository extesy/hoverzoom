var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'pexels.com',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="pexels.com"]',
            [/(jpe?g)\?.*/, /-small(\.jpe?g)/, /-medium(\.jpe?g)/],
            ['$1', '$1', '$1']
        );

        callback($(res));
    }
});