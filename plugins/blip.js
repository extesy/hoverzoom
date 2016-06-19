var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Blip',
    version:'0.4',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="_nano"], img[src*="_pico"], img[src*="_standard"], img[src*="_inmsg"]',
            /(nano|pico|standard|inmsg)/,
            'full'
        );
        callback($(res));
    }
});