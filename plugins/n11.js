var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'n11',
    prepareImgLinks:function (callback) {
        var res = [];
        $('img[src*=".n11.com.tr/a1/"], img[data-original*=".n11.com.tr/a1/"]').each(function () {
            var img = $(this);
            var src = img.attr('data-original') || img.attr('src');
            if (!src) return;
            src = src.replace(/\.com\.tr\/a1\/\d+/, options.showHighRes ? '.com.tr/a1/org' : '.com.tr/a1/1024');
            img.data().hoverZoomSrc = [src];
            res.push(img);
        });
        callback($(res));
    }
});
