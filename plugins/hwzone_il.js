// Copyright (c) 2011 Yoav Vainrich <yoavain@gmail.com> and Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'hwzone.co.il',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a[href*="hwzone.co.il/view-image/hwzone.co.il"]',
            /\/view-image\//,
            '//');
        hoverZoom.urlReplace(res,
            'img[src*="/thumb_"]',
            '/thumb_',
            '/');
        callback($(res));
    }
});