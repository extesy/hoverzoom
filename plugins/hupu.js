// Copyright (c) 2013 Wilson Xu <imwilsonxu@gmail.com> and Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'Hupu',
    prepareImgLinks: function(callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="thumbnail"]',
            'thumbnail',
            'bmiddle'
        );
        hoverZoom.urlReplace(res,
            'img[src*="hoopchina"]',
            /_?(w|small|\d{2,3}x\d{2,3})\./,
            '.'
        );
        hoverZoom.urlReplace(res,
            'img[src*="hoopchina.com.cn"]',
            /\w{4}\.jpg/,
            '.jpg'
        );
        callback($(res));
    }
});