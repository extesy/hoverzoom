var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'phorio',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample: https://picture.phorio.com/photo/866424619/200-crop/image.jpg
        //      -> https://picture.phorio.com/photo/866424619/mars/image.jpg
        hoverZoom.urlReplace(res,
            'img[src],div[style*="url"]',
            /(.*)\/(.*)\/image\.jpg/,
            '$1/mars/image.jpg'
        );

        if (res.length) {
            callback($(res), this.name);
        }
    }
});
