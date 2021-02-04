var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'dirty.ru',
    version: '0.2',
    prepareImgLinks: function (callback) {
        var res = [];
        
        $('[data-src]').filter(function () {
            return $(this).data('src').match(/\/[^:]+\.(?:jpe?g|gifv?|png|webm|mp4|3gpp|svg|webp|bmp|ico|xbm)(?:[\?#].*)?$/i);
        }).each(function () {
            var _this = $(this), data = _this.data();
            if (!data.hoverZoomSrc) {
                var href = data.src;
                if (href.indexOf('//i.imgur.com/') !== -1) {
                    data.hoverZoomSrc = [href.replace(/\.gifv?/, '.mp4'), href.replace(/\.gifv?/, '.webm'), href];
                } else {
                    data.hoverZoomSrc = [href];
                }
                res.push(_this);
            }
        });

        //sample url: https://cdn.jpg.wtf/futurico/99/cf/1587100535-99cfff4adca2c4d4ad6de97bee7fc518.jpeg?w=700
        // remove ?...
        hoverZoom.urlReplace(res,
            'img[src],div[style]',
            /\?.*/,
            ''
        );

        if (res.length) {
            callback($(res), this.name);
        }
    }
});
