var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Diaspora',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="/thumb_"]',
            /thumb_[^_]+_/,
            ''
        );
        callback($(res));
    }
});
