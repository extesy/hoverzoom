// Copyright (c) 2010 Romain Vallet
// Licensed under the MIT license, read license.txt
// Contributed by Alex de Moure

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Badoo',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img',
            /_[^\/]*\.(jpg|png)$/,
            '_300.$1'
        );
        callback($(res));
    }
});