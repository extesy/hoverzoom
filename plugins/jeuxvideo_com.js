var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'JeuxVideo.com',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a img[src*="_m."]',
            '_m.',
            '.'
        );
        callback($(res));
    }
});
