var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Badoo',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img',
            /_[^\/]*\.(jpg|png)$/,
            '_300.$1'
        );
        callback($(res));
    }
});