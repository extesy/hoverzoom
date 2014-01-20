// Copyright (c) 2010 Romain Vallet
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'BlogCdn',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="blogcdn.com"]',
            [/_\d+x\d+\./, '_thumbnail'],
            ['.', '']
        );
        callback($(res));
    }
});