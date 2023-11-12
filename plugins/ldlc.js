var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'LDLC',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // thumbnail: https://media.ldlc.com/r150/ld/products/00/05/93/86/LD0005938670_1.jpg
        //  fullsize: https://media.ldlc.com/ld/products/00/05/93/86/LD0005938670_1.jpg
        hoverZoom.urlReplace(res,
            'img[src*="ldlc.com/r"]',
            /\/r\d+\//,
            '/'
        );

        callback($(res), this.name);
    }
});
