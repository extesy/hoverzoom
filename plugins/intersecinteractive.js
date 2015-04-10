// Copyright (c) 2014 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];

hoverZoomPlugins.push( {
    name: 'intersecinteractive',
    prepareImgLinks: function(callback) {
        var res = [];
        hoverZoom.urlReplace(res, 'a img[src*="images"]', /\/(\d+)\.jpg/, '/images/$1.jpg');
        hoverZoom.urlReplace(res, 'a img[src*="images"]', /\/poster_thumbnail\.jpg/, '/poster.jpg');
        callback($(res));
    }
});
