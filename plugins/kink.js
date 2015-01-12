// Copyright (c) 2014 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];

hoverZoomPlugins.push( {
    name: 'kink',
    prepareImgLinks: function(callback) {
        var res = [];
        hoverZoom.urlReplace(res, 'a img[src*="imagedb"]', /\/i\/h\/\d+/, '/i/h/830');
        callback($(res));
    }
});
