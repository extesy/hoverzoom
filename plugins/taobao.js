var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'TaoBao',
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
        callback($(res));
    }
});
