// Copyright (c) 2010 Romain Vallet
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'hi5',
    version:'0.3',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a img[src$="-01.jpg"]',
            '-01.jpg',
            '-02.jpg'
        );
        callback($(res));

        // Fixes the bad positioning bug.
        // Doesn't seem to break the site's layout.
        $('body').css('position', 'static');
    }
});