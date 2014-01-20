// Copyright (c) 2013 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Default',
    prepareImgLinks:function (callback) {
        var res = [];
        $('a[href]').filter(function () {
            return this.href.match(/\/[^:]+\.(?:jpe?g|gif|png|svg|webp|bmp|ico|xbm)(?:[\?#].*)?$/i);
        }).each(function () {
			var _this = $(this), data = _this.data();
			if (!data.hoverZoomSrc) {
				data.hoverZoomSrc = [this.href];
				res.push(_this);
			}
        });
		if (res.length) {
			callback($(res));
		}
    }
});