var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'So.cl',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="handlers/thumbnail"]',
            /.*[\?&]url=([^&]+).*/,
            '$1'
        );
        callback($(res));
    }
});
