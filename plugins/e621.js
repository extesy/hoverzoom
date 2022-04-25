var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'e621',
    version:'0.3',
    prepareImgLinks:function (callback) {
        var res = [];

        // use data-file-url attribute if available
        $('[data-file-url]').each(function () {
            var _this = $(this);
            var img = _this.find('img');
            img.data().hoverZoomSrc = [_this.attr('data-file-url')];
            res.push(img);
        });

        // some guessing is still needed when no data-file-url attribute is available
        $('img[src*="data/preview"]').filter(function() { if ($(this).parents('[data-file-url]').length) return false; return true }).each(function () {
            var img = $(this),
                src = img.attr('src');
            src = src.replace('/preview', '').replace(/jpg$/, '');
            img.data().hoverZoomSrc = [src + 'jpg', src + 'png', src + 'gif', src + 'webm'];
            res.push(img);
        });

        $('img[src*="/180x180/"], img[src*="/360x360/"]').each(function () {
            var img = $(this),
                src = img.attr('src');
            src = src.replace('/180x180/', '/original/').replace('/360x360/', '/original/').replace(/jpg$/, '');
            img.data().hoverZoomSrc = [src + 'jpg', src + 'png', src + 'gif', src + 'webm'];
            res.push(img);
        });

        callback($(res), this.name);
    }
});
