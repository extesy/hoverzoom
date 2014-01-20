// Copyright (c) 2013 Zach Cheung <kurorozhang@gmail.com> and Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Bluray',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="/covers/"]',
            /(large|medium|small)/,
            'front'
        );
        hoverZoom.urlReplace(res,
            'img[src*="_tn."]',
            '_tn.',
            '_large.'
        );
        callback($(res));
    }
});