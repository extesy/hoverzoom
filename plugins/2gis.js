var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'2gis',
    version:'1.0',
    prepareImgLinks:function (callback) {

        var res = [];

        // page with samples: https://2gis.ru/orenburg?m=55.128792%2C51.760619%2F13.23&layer=photos
        // thumbnail:         https://i.photo.2gis.com/images/branch/48/6755399466628955_a374_128x128.jpg
        // fullsize:          https://i.photo.2gis.com/images/branch/48/6755399466628955_a374.jpg
        hoverZoom.urlReplace(res,
            'img[src], [style*="url"]',
            /_\d+x\d+/,
            ''
        );

        callback($(res), this.name);
    }
});