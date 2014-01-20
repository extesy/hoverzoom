// Copyright (c) 2010 Romain Vallet
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Last.fm',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="/serve/"]',
            /\/serve\/.*\//,
            '/serve/_/'
        );
        hoverZoom.urlReplace(res,
            '.albumCover img[src*="/serve/"]',
            /\/serve\/.*\//,
            '/serve/_/',
            ':eq(0)'
        );
        hoverZoom.urlReplace(res,
            '.albumCover img[src*="amazon.com"]',
            /(\/[^\.]+)[^\/]+\.(\w+)$/,
            '$1.$2',
            ':eq(0)'
        );
        callback($(res));
    }
});