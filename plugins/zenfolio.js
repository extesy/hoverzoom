// Copyright (c) 2014 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];

hoverZoomPlugins.push( {
    name: 'zenfolio',
    prepareImgLinks: function(callback) {
        var res = [];
        if (options.showHighRes)
            hoverZoom.urlReplace(res, 'a img.pv-img', /-\d+\.jpg/, '-5.jpg');
        else 
            hoverZoom.urlReplace(res, 'a img.pv-img', /-\d+\.jpg/, '-4.jpg');
        callback($(res));
    }
});
