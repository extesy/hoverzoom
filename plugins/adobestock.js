var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'adobestock.com',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src]',
            ['/240_F', '/500_F'],
            ['/1000_F', '/1000_F']
        );

        callback($(res), this.name);
    }
});