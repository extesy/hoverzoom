var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Yfrog',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        $('a[data-expanded-url^="http://yfrog."], img[src*=":twthumb"]').each(function () {
            var _this = $(this),
                url = this.getAttribute('data-expanded-url') || this.getAttribute('src');
            url = url.replace(':twthumb', '');
            _this.data().hoverZoomSrc = [url + ':medium', url + ':frame'];
            res.push(_this);
        });
        callback($(res));
    }
});
