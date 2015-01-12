// Copyright (c) 2014 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];

hoverZoomPlugins.push( {
    name: 'fetlife',
    prepareImgLinks: function(callback) {
        var res = [];
        hoverZoom.urlReplace(res, 'a img[src*="flpics"]', /_\d+\.jpg/, '_958.jpg');
        hoverZoom.urlReplace(res, 'a.main_pic span.fake_img', /_\d+\.jpg/, '_958.jpg');
        // $('a.main_pic span.fake_img').each(function() {
            // var fake_img = $(this), 
                // link = fake_img.parents('a:eq(0)'), 
                // src = fake_img.css('background-image');
            // src = src.replace("url(", "").replace(")", "").replace("_720.jpg", "_958.jpg");
            // link.data('hoverZoomSrc', [src]); 
            // res.push(link);
        // });
        callback($(res));
    }
});
