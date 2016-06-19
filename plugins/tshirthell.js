var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'T-Shirt Hell',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a img',
            '_thumb.jpg',
            '_bm.gif'
        );
        callback($(res));
    }
});
