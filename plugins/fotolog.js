// Copyright (c) 2011 Romain Vallet
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Fotolog',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [],
            filter = 'img[src*="_t."], img[src*="_m."]',
            search = /_(t|m)\./;
        hoverZoom.urlReplace(res, filter, search, '.');
        hoverZoom.urlReplace(res, filter, search, '_f.');
        callback($(res));
    }
});
