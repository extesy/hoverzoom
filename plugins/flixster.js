// Copyright (c) 2010 Romain Vallet
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Flixster',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a img[src*="_tmb."]:not([src*="/critic/"]), a img[src*="_msq."], a img[src*="_pro."]',
            /_(tmb|msq|pro)\./,
            '_gal.'
        );
        callback($(res));
    }
});