var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'Default',
    version:'0.7',
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

        // handle <video[src]> elements
        $('video[src]').filter(function () {
            $(this).data().hoverZoomSrc = [];
            if (!options.zoomVideos)
                return false;
            if (typeof(this.src) != 'string')
			    return false;
            if (this.src.match(/^blob:/))
                return false;
            return true;
        }).each(function () {
            var _this = $(this), data = _this.data();
            // discard video already being played
            if (this.paused || this.controls === false) {
                var src = this.src;
                if (!src.match(reVideos))
                    src += '.video';
                data.hoverZoomSrc = [src];
                res.push(_this);
            }
        });

        // handle <video><source[src]> elements
        $('video:not([src])').filter(function () {
            $(this).data().hoverZoomSrc = [];
            if (!options.zoomVideos)
                return false;
            if ($(this).find('source[src]')[0] == undefined)
                return false;
            var src = $(this).find('source[src]')[0].src;
            if (typeof(src) != 'string')
			    return false;
            return true;
        }).each(function () {
            var _this = $(this), data = _this.data();
            // discard video already being played
            if (this.paused) {
                var src = _this.find('source')[0].src;
                if (!src.match(reVideos))
                    src += '.video';
                data.hoverZoomSrc = [src];
                res.push(_this);
            }
        });

        // handle <audio[src]> elements
        $('audio[src]').filter(function () {
            if (!options.playAudio)
                return false;
            var divAudio = $(this).parents('div')[0];
            if (divAudio == undefined)
                return false;
            $(divAudio).data().hoverZoomSrc = [];
            if (typeof(this.src) != 'string')
			    return false;
            return true;
        }).each(function () {
            var _this = $(this), divAudio = _this.parents('div')[0], _divAudio = $(divAudio), data = _divAudio.data();
            // discard audio already being played
            if (this.paused) {
                var src = this.src;
                if (!src.match(reAudios))
                    src += '.audio';
                data.hoverZoomSrc = [src];
                res.push(_divAudio);
            }
        });

        // handle <audio><source[src]> elements
        $('audio:not([src])').filter(function () {
            $(this).data().hoverZoomSrc = [];
            if (!options.playAudio)
                return false;
            if ($(this).find('source[src]')[0] == undefined)
                return false;
            var src = $(this).find('source[src]')[0].src;
            if (typeof(src) != 'string')
			    return false;
            return true;
        }).each(function () {
            var _this = $(this), data = _this.data();
            // discard audio already being played
            if (this.paused) {
                var src = _this.find('source')[0].src;
                if (!src.match(reAudios))
                    src += '.audio';
                data.hoverZoomSrc = [src];
                res.push(_this);
            }
        });

        if (res.length) {
            callback($(res), this.name);
        }
    }
});
