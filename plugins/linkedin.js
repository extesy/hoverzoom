var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'LinkedIn',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="/shrink_"]',
            /\/shrink_.*?\//,
            '/'
        );
        callback($(res));
    }
});
