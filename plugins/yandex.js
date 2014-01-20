// Copyright (c) 2013 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Yandex',
    prepareImgLinks:function (callback) {
        /*var res = [];
        hoverZoom.urlReplace(res,
            'a[href*="img_url="]',
            /.*img_url=([^&]*)(.*)/,
            '$1'
        );
        callback($(res));*/
    }
});
