var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Inkbunny',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        $('img[src*="thumbnails/"], img[src*="preview/"]').each(function () {
            var img = $(this),
                src = img.attr('src'),
                origSrc = src;

            if (/\/thumbnails\/\w*/.test(src))
                src = src.replace(/\/thumbnails\/\w*/, '/files/full');
            if (/\/preview/.test(src))
                src = src.replace(/\/preview/, '/full');
            if (/\/private_thumbnails\/\w*/.test(src))
                src = src.replace(/\/private_thumbnails\/\w*/, '/private_files/full');

            src = src.replace(/(_noncustom)?\.\w*$/, '.');
            img.data().hoverZoomSrc = [src + 'jpg', src + 'png', src + 'gif',
                origSrc.replace(/thumbnails\/\w*/, 'thumbnails/huge'),
                origSrc.replace(/thumbnails\/\w*/, 'thumbnails/large')];

            res.push(img);
        });
        callback($(res));
    }
});