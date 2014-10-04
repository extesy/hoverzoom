// Copyright (c) 2014 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

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