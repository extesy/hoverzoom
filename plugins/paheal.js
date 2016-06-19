var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Paheal.net',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="thumbs"]',
            ['thumbs', 'thumbs'],
            ['images', 'images']
        );
        callback($(res));
    }
});
