var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'Default',
    version:'0.6',
    prepareImgLinks: function (callback) {
        const res = [];
        const reVideos = /\/[^:]+\.(?:3gpp|m4v|mkv|mp4|ogv|webm)(?:[\?#].*)?(?:\/)?$/i
        const reImages = /\/[^:]+\.(?:avif|bmp|gifv?|ico|jfif|jpe|jpe?g|png|svg|webp|xbm)(?:[\?#].*)?(?:\/)?$/i
        const rePlaylists = /\/[^:]+\.(?:m3u8)(?:[\?#].*)?(?:\/)?$/i
        const reAudios = /\/[^:]+\.(?:flac|m4a|mp3|oga|ogg|opus|wav)(?:[\?#].*)?(?:\/)?$/i
        $('a[href]').filter(function () {
            if (typeof(this.href) != 'string')
			    return false;
            if (this.href.substr(0, 10).toLowerCase() === 'data:image')
                return false;
            if (this.href.match(reImages))
                return true;
            if (this.href.match(reVideos))
                return true;
            if (this.href.match(rePlaylists))
                return true;
            if (this.href.match(reAudios))
                return true;
            return false;
        }).each(function () {
            const _this = $(this), data = _this.data();
            if (!data.hoverZoomSrc) {
                const src = this.href;
                if (!options.zoomVideos || ((src.indexOf('imgur.com') === -1 || src.indexOf('slimgur.com') !== -1) && src.indexOf('gfycat.com') === -1)) {
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
