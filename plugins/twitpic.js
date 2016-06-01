var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Twitpic',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        $('a[data-expanded-url*="twitpic.com"], a[data-url*="twitpic.com"], img[src*="twitpic.com"]').each(function () {
            var _this = $(this),
                url = this.getAttribute('data-expanded-url') || this.getAttribute('data-url') || this.getAttribute('src');
            _this.data().hoverZoomSrc = [url.replace(/twitpic\.com\/([^\/]*)$/, 'twitpic.com/show/' + (options.showHighRes ? 'full' : 'large') + '/$1')];
            res.push(_this);
        });
        callback($(res));
    }
});
