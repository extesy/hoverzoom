var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Instagram',
    prepareImgLinks:function (callback) {
        var res = [];
        $('img[src*="/e35/"]').each(function () {
            var img = $(this), link = img.parent().parent().parent();
            var url = img.attr('src').replace('/sh0.08/', '/').replace(/\/[sp]\d\d\dx\d\d\d\//, '/');
            link.data().hoverZoomSrc = [url];
            res.push(link);
        });
        // hoverZoom.urlReplace(res, 'img[src*="/e35/"]', '/s640x640/sh0.08/', '/', 'a');
        callback($(res));
    }
});
