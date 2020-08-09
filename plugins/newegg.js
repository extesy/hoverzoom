var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'NewEgg',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="?$"]',
            /\?.*$/,
            ''
        );
        hoverZoom.urlReplace(res,
            'img[src*="neweggimages"]',
            /\/P\d+\//,
            '/P800/'
        );
        hoverZoom.urlReplace(res,
            'img[src]',
            '/ProductImage/',
            '/ProductImage1280/'
        );
        hoverZoom.urlReplace(res,
            'img[src]',
            /\/ProductImageCompressAll.*\//,
            '/ProductImageCompressAll1280/'
        );
        callback($(res));
    }
});
