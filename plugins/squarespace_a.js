var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'SquareSpace_a',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src*="squarespace"],[style*="squarespace"]',
            /(\?format=\d+)/,
            '?format=2500'
        );

        if (res.length) {
            callback($(res), this.name);
        }
    }
});
