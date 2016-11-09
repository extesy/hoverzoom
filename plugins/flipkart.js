var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Flipkart',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="rukminim1.flixcart.com"]',
            /image\/\d+\/\d+/,
            'image/500/500'
        );
        callback($(res));
    }
});