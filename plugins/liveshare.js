// Copyright (c) 2011 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'LiveShare',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img.thumb',
            '_128.',
            '_480.'
        );
        hoverZoom.urlReplace(res,
            'img.thumb',
            '_128.',
            '_960.'
        );
        callback($(res));
    }
});