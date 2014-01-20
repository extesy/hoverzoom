// Copyright (c) 2011 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'rootmusic',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a.photo img',
            /_[sqta]\./,
            '_n.'
        );
        hoverZoom.urlReplace(res,
            'img[src*="graph.facebook.com"]',
            /picture$/,
            'picture?type=album'
        );
        callback($(res));
    }
});