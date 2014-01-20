// Copyright (c) 2013 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Choualbox',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res, 'img[src*="/Img_resize/"]', 'Img_resize', 'Img');
        hoverZoom.urlReplace(res, 'img[src*="/mini.php"]', /\/mini\.php\?src=(.*?)&.*/, '$1');
        callback($(res));
    }
});