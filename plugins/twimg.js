var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Twimg.com',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="twimg.com"]',
            /_(normal|mini)/,
            ''
        );
        callback($(res));
    }
});
