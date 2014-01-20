// Copyright (c) 2013 Manuel Bissinger <manuel.bissinger@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Kununu.com',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="crop_"]',
            /crop_\d{1,3}_\d{1,3}\//,
            ''
        );
		callback($(res));
    }
});
