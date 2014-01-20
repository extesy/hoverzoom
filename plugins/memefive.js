// Copyright (c) 2013 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'MemeFive',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a[href*="memefive.com/"]',
            /^.*www.memefive.com\/(\w+).*$/,
            'http://www.memefive.com/memes/$1.jpg'
        );
        callback($(res));
    }
});