var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'vBulletin',
    version:'0.1',
    prepareImgLinks:function (callback) {
        if (!hoverZoom.pageGenerator || hoverZoom.pageGenerator.indexOf('vBulletin') == -1) {
            return;
        }
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="thumb=1"]',
            'thumb=1',
            'thumb=0'
        );
        callback($(res));
    }
});
