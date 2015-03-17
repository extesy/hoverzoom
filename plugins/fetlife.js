// Copyright (c) 2014 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];

hoverZoomPlugins.push( {
    name: 'fetlife',
    prepareImgLinks: function(callback) {
        var res = [];
        hoverZoom.urlReplace(res, 'a img[src*="flpics"]', /_\d+\.jpg/, '_958.jpg');
        // The following line grabs the image from its frame on an individual picture's page;
        // unused since you can already access the full image from the gallery view
        //hoverZoom.urlReplace(res, 'a.main_pic span.fake_img', /_\d+\.jpg/, '_958.jpg');
        callback($(res));
    }
});
