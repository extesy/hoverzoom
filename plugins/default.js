var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'Default',
    version:'0.4',
    prepareImgLinks: function (callback) {
        var res = [];
        const reVideos = /\/[^:]+\.(?:3gpp|m4v|mkv|mp4|ogv|webm)(?:[\?#].*)?(?:\/)?$/i
        const reImages = /\/[^:]+\.(?:bmp|gifv?|ico|jpe?g|png|svg|webp|xbm)(?:[\?#].*)?(?:\/)?$/i
        $('a[href]').filter(function () {
            if (typeof(this.href) != 'string')
			    return false;
            if (this.href.substr(0, 10).toLowerCase() == 'data:image')
                return false;
            if (this.href.match(reImages))
                return true;
            if (this.href.match(reVideos))
                return true;
            return false;
        }).each(function () {
            var _this = $(this), data = _this.data();
            if (!data.hoverZoomSrc) {
                var src = this.href;
                if (!options.zoomVideos || ((src.indexOf('imgur.com') == -1 || src.indexOf('slimgur.com') != -1) && src.indexOf('gfycat.com') == -1 && src.indexOf('pornbot.net') == -1)) {
                    data.hoverZoomSrc = [src];
                    res.push(_this);
                }
            }
        });
        if (res.length) {
            callback($(res), this.name);
        }
    }
});
