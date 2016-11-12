var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'n11',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*=".n11.com.tr/a1/"]',
            /\.com\.tr\/a1\/\d+/,
            options.showHighRes ? '.com.tr/a1/org' : '.com.tr/a1/1024'
        );
        callback($(res));
    }
});
