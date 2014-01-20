// Copyright (c) 2010 Romain Vallet
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Picasa Web Albums (a)',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [],
            filter = 'a[href*=".ggpht.com"], a img[src*=".ggpht.com"], a img[src*=".blogspot.com"]',
            search = /\/s\d+(-[ch])?\//;

        hoverZoom.urlReplace(res, filter, search, '/s800/');
        if (options.showHighRes) {
            hoverZoom.urlReplace(res, filter, search, '/s0/');
        }

        callback($(res));
    }
});