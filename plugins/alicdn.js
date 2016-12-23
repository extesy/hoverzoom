var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'alicdn',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*=".jpg_"]',
            /jpg_.*/,
            'jpg'
        );
        hoverZoom.urlReplace(res,
            'img[src*=".png_"]',
            /png_.*/,
            'png'
        );
        hoverZoom.urlReplace(res,
            'img[src*=".jpg"]',
            /jpg/,
            'jpg '
        );
        hoverZoom.urlReplace(res,
            'img[src*=".png"]',
            /png/,
            'png '
        );
        callback($(res));
    }
});
