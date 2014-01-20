// Copyright (c) 2011 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Instructables',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a[href*=".THUMB."], img[src*=".THUMB."], img[src*=".SQUARE."]',
            /(SQUARE|THUMB)/,
            'LARGE'
        );
        callback($(res));
    }
});