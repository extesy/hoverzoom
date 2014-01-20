// Copyright (c) 2010 Romain Vallet
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'openDesktop.org',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var imgs = $('a img[src*="CONTENT"]');
        var res = [];
        var re = /(content|knowledgebase)-m(\d+)\/(m?)/;
        imgs.each(function () {
            var _this = $(this);
            var src = _this.attr('src');
            var index = src.match(re);
            if (index) {
                var link = _this.parents('a:eq(0)');
                var href = link.attr('href');
                if (!href) return;
                var param = 'file' + index[2] + '=';
                var fileIndex = href.indexOf(param);
                var pre = index[1] == 'content' ? 'pre' : 'pics';
                if (fileIndex > -1) {
                    src = '/CONTENT/' + index[1] + '-' + pre + index[2] + '/' + href.substring(fileIndex + param.length, href.indexOf('&', fileIndex));
                } else {
                    src = src.replace(re, '$1-' + pre + '$2/');
                }
                var srcs = [src];
                if (src.substr(src.lastIndexOf('.') + 1).toLowerCase() == 'png') {
                    srcs.push(src.replace(/png$/i, 'jpg'));
                    srcs.push(src.replace(/png$/i, 'JPG'));
                    srcs.push(src.replace(/png$/i, 'jpeg'));
                    srcs.push(src.replace(/png$/i, 'JPEG'));
                }
                link.data().hoverZoomSrc = srcs;
                res.push(link);
            }
        });
        callback($(res));
    }
});