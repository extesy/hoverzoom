var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'MediaWiki',
    version:'0.5',
    prepareImgLinks:function (callback) {
        if (!hoverZoom.pageGenerator || hoverZoom.pageGenerator.indexOf('MediaWiki') == -1) {
            return;
        }
        var res = [];
        $('img[src*="thumb/"]').each(function () {
            var _this = $(this),
                src = this.src,
                srcs = [],
                ext;
            if (src.substr(src.length - 8) == '.svg.png') {
                ext = '.svg';
            }
            else {
                ext = src.substr(src.lastIndexOf('.'));
            }
            if (!options.showHighRes) {
                srcs.push(src.replace(/\/\d+px-(?:.*?-)?/, '/800px-'));
            }
            srcs.push(src.substring(0, src.indexOf(ext) + ext.length).replace('thumb/', ''));
            _this.data().hoverZoomSrc = srcs;
            res.push(_this);
        });
        callback($(res));
    }
});
