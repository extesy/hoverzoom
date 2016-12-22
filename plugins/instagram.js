var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Instagram',
    prepareImgLinks:function (callback) {
        var res = []
        $('a').each(function () {
            var _this = $(this), link, url, thumbUrl;
            link = _this;
            thumbUrl = $(this).find('img')[0];
            if (!thumbUrl) {
                return;
            }
            thumbUrl = thumbUrl.src;
            url = thumbUrl;
            url = url.replace(/\?ig_cache_key=.*$/, '')
            url = unescape(url);
            var data = link.data().hoverZoomSrc;
            if (Object.prototype.toString.call(data) === '[object Array]') {
                data.unshift(url);
            } else {
                data = [url];
            }
            link.data().hoverZoomSrc = data;
            res.push(link);
        });
        callback($(res));
    }
});
