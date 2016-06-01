var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Gamekult',
    version:'0.3',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a img[src*="_1.jpg"]',
            '_1.jpg',
            '_2.jpg'
        );
        callback($(res));
    }
});