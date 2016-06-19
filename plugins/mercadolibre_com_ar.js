var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'mercadolibre.com.ar',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="-S."],img[src*="-G."],img[src*="-T."]',
            /-[SGT]\./,
            '-O.'
        );
        callback($(res));
    }
});
