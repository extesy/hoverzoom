var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'e621',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        $('img[src*="data/preview"]').each(function () {
            var img = $(this),
                src = img.attr('src');
            src = src.replace('/preview', '').replace(/jpg$/, '');
            img.data().hoverZoomSrc = [src + 'jpg', src + 'png', src + 'gif'];
            res.push(img);
        });
        callback($(res));
    }
});