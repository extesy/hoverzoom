var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Amazon',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*=".images-amazon.com"]:not([src*="g-ecx.images-amazon.com"]), img[src*="/img.amazon."], .iv_thumb_image, img[src*="/ciu/"]',
            /_.+_\./,
            ''
        );
        callback($(res));
    }
});