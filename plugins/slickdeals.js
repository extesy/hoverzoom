// Copyright (c) 2016 Oleg Anashkin <oleg.anashkin@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'slickdeals',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src$=".thumb"]',
            [/\/\d+x\d+\//, '.thumb'],
            ['/', '.attach']
        );
        callback($(res));
    }
});
