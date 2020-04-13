var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Amazon',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*=".images-amazon.com"]:not([src*="g-ecx.images-amazon.com"]), img[src*=".ssl-images-amazon.com"]:not([src*="g-ecx.ssl-images-amazon.com"]), mg[src*="/img.amazon."], .iv_thumb_image, img[src*="/ciu/"]',
            /_.+\./,
            ''
        );
        callback($(res));
    }
});