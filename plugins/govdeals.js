var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'govdeals',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src]',
            /\/[Tt]humbnails\//,
            '/'
        );       

        callback($(res), this.name);
    }
});
