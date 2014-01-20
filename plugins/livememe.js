// Copyright (c) 2011 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Livememe.com',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a[href*="livememe.com/"]',
            /^.*www.livememe.com\/(\w+).*$/,
            'http://www.livememe.com/$1.jpg'
        );
        callback($(res));
    }
});