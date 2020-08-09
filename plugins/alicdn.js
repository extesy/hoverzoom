var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'alicdn',
    version:'0.2',
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
        // Add space to url so that the thumbURL isn't seen as equal,
        // which would cause the image to be skipped
        /*hoverZoom.urlReplace(res,
            'img[src*=".jpg"]',
            /jpg/,
            'jpg '
        );
        hoverZoom.urlReplace(res,
            'img[src*=".png"]',
            /png/,
            'png '
        );*/
        callback($(res));
    }
});
