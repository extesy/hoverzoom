var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'canmore',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src], [style*="url"]',
            /\/.\//,
            '/l/'
        );

        callback($(res), this.name);
    }
});
