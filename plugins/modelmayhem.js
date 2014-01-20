// Copyright (c) 2011 Dave Disser <disser@gmail.com>, Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'ModelMayhem',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="/photos/"]',
            '_m.jpg',
            '.jpg'
        );
        hoverZoom.urlReplace(res,
            'img[src*="/avatars/"]',
            '_t.jpg',
            '_m.jpg'
        );
        callback($(res));
    }
});
