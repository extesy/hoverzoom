var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Pixnet.net',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="_s."]',
            '_s.',
            options.showHighRes ? '.' : '_b.'
        );
        callback($(res));
    }
});
