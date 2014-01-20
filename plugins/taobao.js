// Copyright (c) 2013 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

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