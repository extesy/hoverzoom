var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'deviantART',
    version:'0.3',
    prepareImgLinks:function (callback) {
        var res = [];
        $('a[data-super-img], span[data-super-img], div[data-super-img]').each(function () {
            var _this = $(this),
                url = this.dataset.superImg;
            if (options.showHighRes && this.dataset.superFullImg)
                url = this.dataset.superFullImg;
            _this.data().hoverZoomSrc = [url];
            res.push(_this);
        });
        hoverZoom.urlReplace(res,
            'a:not([data-super-img]) img[src*="deviantart.net/fs"], [style*="deviantart.net/fs"]',
            /\/(fs\d+)\/\d+\w+\//,
            '/$1/',
            ':eq(0)'
        );
        hoverZoom.urlReplace(res,
            'img[src]',
            /(.*)\/v1\/(.*)(\?token=.*)/,
            '$1$3'
        );
        callback($(res));
    }
});
