// Copyright (c) 2010 Romain Vallet
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Wired',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img',
            /-\d+x\d+\./,
            '.'
        );
        hoverZoom.urlReplace(res,
            'img[src*="/thumbs/"]',
            'thumbs/thumbs_',
            ''
        );
        hoverZoom.urlReplace(res,
            'img[src*="_w"]',
            /_wd?\./,
            '_bg.'
        );
        callback($(res));
    }
});