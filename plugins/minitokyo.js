// Copyright (c) 2013 Zach Cheung <kurorozhang@gmail.com> and Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Minitokyo',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="/view/"], img[src*="/thumbs/"], [style*="/view/"], [style*="/thumbs/"]',
            /(view|thumbs)/,
            'downloads'
        );
        callback($(res));
    }
});
