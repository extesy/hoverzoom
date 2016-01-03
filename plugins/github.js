// Copyright (c) 2012 Romain Vallet <romain.vallet@gmail.com>
// Copyright (c) 2016 Oleg Anashkin <oleg.anashkin@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'GitHub',
    prepareImgLinks:function (callback) {
        var res = [];
        $('a > img[data-canonical-src]').each(function () {
            var img = $(this);
            img.data('hoverZoomSrc', [img.attr('data-canonical-src')]);
            img.data('hoverZoomCaption', [img.attr('alt')]);
            res.push(img);
        });
        callback($(res));
    }
});
