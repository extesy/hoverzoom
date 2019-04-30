var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'hiptest',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a[href*="attachments"]',
            /(.*)/, '$1/'
        );
        callback($(res));
    }
});
