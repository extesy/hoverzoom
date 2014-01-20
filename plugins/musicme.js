// Copyright (c) 2010 Romain Vallet
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'MusicMe',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a img.icover, div.radiostickerpic img',
            /\/jpg.*\//,
            '/jpg343/',
            ':eq(0)'
        );
        callback($(res));
    }
});