var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'lostfilm.info',
    version:'1.0',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src]',
            ['_50.', '/150', '/40'],
            ['.', '/', '/']
        );
        callback($(res), this.name);
    }
});
