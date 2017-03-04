var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Instagram',
    prepareImgLinks:function (callback) {
        var res = [];
        $('img[src*="/e35/"]').each(function () {
            var img = $(this), link = img.parent().parent().parent();
            link.data().hoverZoomSrc = [img.attr('src').replace('/s640x640/sh0.08/', '/')];
            res.push(link);
        });
        // hoverZoom.urlReplace(res, 'img[src*="/e35/"]', '/s640x640/sh0.08/', '/', 'a');
        callback($(res));
    }
});
