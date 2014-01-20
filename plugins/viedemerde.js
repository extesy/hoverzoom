// Copyright (c) 2010 Romain Vallet
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Vie de merde',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        $('img.avatar').each(function () {
            var img = $(this),
                url = img.attr('original') || img.attr('src');
            img.data().hoverZoomSrc = [
                url.replace(/\/(icon|mid)\//, '/original/'),
                url.replace('/icon/', '/mid/')
            ];
            res.push(img);
        });
        callback($(res));
    }
});