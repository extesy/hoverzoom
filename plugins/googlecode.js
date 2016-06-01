var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Google code',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        $('#filelist').find('a[href]').filter(function () {
            return this.href.match(/\/source\/browse\/.*\.(?:jpe?g|gif|png|svg|webp|bmp|ico|xbm)$/i);
        }).each(function () {
                var _this = $(this), data = _this.data();
                data.hoverZoomSrc = [this.href.replace(/code\.google\.com\/p\/([^\/]+)\/source\/browse/, '$1.googlecode.com/svn')];
                res.push(_this);
            });
        callback($(res));
    }
});