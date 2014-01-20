// Copyright (c) 2010 Romain Vallet
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Copains d avant',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="image-uniservice"]',
            /\/image\/\d+\//,
            '/image/450/'
        );
        hoverZoom.urlReplace(res,
            'img[src*="image-parcours"]',
            /\/image\/\d+\//,
            '/image/750/'
        );
        callback($(res));
    }
});