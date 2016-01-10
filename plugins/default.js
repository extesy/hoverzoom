// Copyright (c) 2013 Romain Vallet <romain.vallet@gmail.com>
// Copyright (c) 2016 Oleg Anashkin <oleg.anashkin@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'Default',
    prepareImgLinks: function (callback) {
        var res = [];
        $('a[href]').filter(function () {
            if (this.href.substr(0, 10).toLowerCase() == 'data:image')
                return false;
            return this.href.match(/\/[^:]+\.(?:jpe?g|gifv?|png|webm|mp4|svg|webp|bmp|ico|xbm)(?:[\?#].*)?$/i);
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
            callback($(res));
        }
    }
});
