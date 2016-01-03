// Copyright (c) 2016 Oleg Anashkin <oleg.anashkin@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'Streamable',
    prepareImgLinks: function (callback) {
        var res = [];
        $('a[href*="//streamable.com/"]').each(function () {
            var link = $(this),
                url = link.attr('href'),
                regex = url.match(/\/([\d\w]+)$/);
            if (regex) {
                var id = regex[1];
                link.data().hoverZoomSrc = ['//cdn.streamable.com/video/mp4/' + id + '.mp4'];
                res.push(link);
            }
        });
        callback($(res));
    }
});
