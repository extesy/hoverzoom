var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Play.com',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a img[src$="s.jpg"], a img[src$="m.jpg"]',
            /[sm]\.jpg/,
            'x.jpg'
        );
        return callback($(res));
    }
});
