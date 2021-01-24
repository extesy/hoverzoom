var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'thingiverse.com',
    version:'1.0',
    prepareImgLinks:function (callback) {

        var res = [];

        var re1 = /_preview_.*?\./;
        var re2 = /_display_.*?\./;
        var re3 = /_thumb_.*?\./;
        var patch = '_display_large.';

        hoverZoom.urlReplace(res,
            'img[src]',
            [re1, re2, re3],
            [patch, patch, patch]
        );

        $('[style*=url]').each(function() {
            // extract url from style
            var backgroundImage = this.style.backgroundImage;
            var reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            // remove leading & trailing quotes
            var backgroundImageUrl = backgroundImage.replace(/^['"]/, '').replace(/['"]+$/, '');
            var fullsizeUrl = backgroundImageUrl.replace(re1, patch).replace(re2, patch).replace(re3, patch);
            if (fullsizeUrl != backgroundImageUrl) {
                var link = $(this);
                if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                    link.data().hoverZoomSrc.unshift(fullsizeUrl);
                    res.push(link);
                }
            }
        });

        callback($(res), this.name);
    }
});