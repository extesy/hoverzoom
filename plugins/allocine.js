var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Allocine',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];

        /*$('a img:not([src$="empty.gif"]):not(.hnipimg)').each(function () {
            var img = $(this);
            var src = img.attr('src');
            if (!src) return;
            var aSrc = src.split('/');
            if (options.showHighRes) {
                aSrc.splice(3, 1)
            } else {
                aSrc[3] = 'r_600_600';
            }
            src = aSrc.join('/');
            var link = $(this).parents('a:eq(0)');
            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (link.data().hoverZoomSrc.indexOf(src) == -1) {
                link.data().hoverZoomSrc.unshift(src);
                res.push(link);
            }
        });*/

        $('a img:not([src$="empty.gif"]):not(.hnipimg)').each(function () {
            var link = $(this).parents('a:eq(0)');
            var img = $(this);
            var src = img.attr('src');
            if (!src) return;
            var aSrc = src.replace(/\/[cr]_\d+_\d+\//, '/');

            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (link.data().hoverZoomSrc.indexOf(aSrc) == -1) {
                link.data().hoverZoomSrc.unshift(aSrc);
                res.push(link);
            }
        });

        hoverZoom.urlReplace(res,
            'img[src]',
            /\/[cr]_\d+_\d+\//,
            '/'
        );

        callback($(res), this.name);
    }
});