// Copyright (c) 2010 Romain Vallet
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'MySpace',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a img[src*="ac-images.myspacecdn.com"], a img[src*="images.socialplan.com"]',
            [/\/[sm]_/, '_t.'],
            ['/l_', '_p.']
        );
        callback($(res));
    }
});