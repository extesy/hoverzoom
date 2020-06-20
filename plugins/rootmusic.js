var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'RootMusic',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a.photo img',
            /_[sqta]\./,
            '_n.'
        );
        hoverZoom.urlReplace(res,
            'img[src*="graph.facebook.com"]',
            /picture$/,
            'picture?type=album'
        );
        callback($(res));
    }
});
