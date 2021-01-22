var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Steam',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src*="/avatars/"]:not([src*="_full."])',
            /(_medium)?\.(jpg|png)$/,
            '_full.$2'
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            /\.\d+x\d+\./,
            '.1920x1080.'
        );

        hoverZoom.urlReplace(res,
            'img[src*=".resizedimage"]',
            /\d+x\d+\.resizedimage/,
            '',
            ':eq(0)'
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            /\?[^t].*/,
            ''
        );

        $('[style*=url]').each(function() {
            // extract url from style
            var backgroundImage = this.style.backgroundImage;
            var reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            // remove leading & trailing quotes
            var backgroundImageUrl = backgroundImage.replace(/^['"]/, '').replace(/['"]+$/, '');
            var fullsizeUrl = backgroundImageUrl.replace(/\.\d+x\d+\./, '.1920x1080.');
            if (fullsizeUrl != backgroundImageUrl) {
                var link = $(this);
                if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                    link.data().hoverZoomSrc.unshift(fullsizeUrl);
                    res.push(link);
                }
            }
        });

        callback($(res));
    }
});
