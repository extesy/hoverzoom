var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'freerangestock',
    version:'1.0',
    prepareImgLinks:function (callback) {

        var res = [];

        hoverZoom.urlReplace(res,
            'img[src]',
            '/sample/',
            '/fullsize/'
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            '/thumbnail/',
            '/fullsize/'
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            '/thumbnail/',
            '/sample/'
        );

        callback($(res), this.name);
    }
});
