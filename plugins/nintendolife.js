var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Nintendo Life',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        var reFind = /\/\d+x\d+\./;
        var reReplace = '/large.';

        hoverZoom.urlReplace(res,
            'img[src]',
            /(avatar|icon|tiny|small)\./,
            'large.'
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            reFind,
            reReplace
        );

        $('[style*=url]').each(function() {
            // extract url from style
            var backgroundImage = this.style.backgroundImage;
            var reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            // remove leading & trailing quotes
            var backgroundImageUrl = backgroundImage.replace(/^['"]/, '').replace(/['"]+$/, '');
            var fullsizeUrl = backgroundImageUrl.replace(reFind, reReplace);
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
