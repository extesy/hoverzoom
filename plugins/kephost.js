var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Kephost',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="kephost.com/images"]',
            /\.md\./,
            '.'
        );
        callback($(res));
    }
});