// Copyright (c) 2010 Romain Vallet
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Phapit.com',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a[href*="phapit.com/image/"]',
            /.*\/(phap\d*)(\/.*)?/,
            'http://images.phapit.com/uploaded_pics/$1.jpg'
        );
        if (res.length) {
            callback($(res));
        }
    }
});