// Copyright (c) 2010 Romain Vallet
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Baidu',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // Image search
        $("a[href^=/i?]").each(function () {
            var _this = $(this);
            var src = _this.attr('onclick');
            if (src) {
                src = src.toString();
                src = src.substring(src.indexOf('http'), src.lastIndexOf("',"));
                _this.data().hoverZoomSrc = [src];
                res.push(_this);
            }
        });

        // Encyclopedia, Space, etc
        hoverZoom.urlReplace(res,
            'a img[src*="/abpic/"], a img[src*="/mpic/"]',
            /abpic|mpic/,
            'pic'
        );

        // News
        $('a img[src*="/it/u="]').each(function () {
            var _this = $(this);
            var src = _this.attr('src');
            if (src) {
                src = src.replace(/.*\/it\/u=(.*)&.*/, '$1');
                src = unescape(src);
                _this.data().hoverZoomSrc = [src];
                res.push(_this);
            }
        });

        callback($(res));
    }
});