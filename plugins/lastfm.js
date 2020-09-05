var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Last.fm',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="/serve/"]',
            /\/serve\/.*\//,
            '/serve/_/'
        );
        hoverZoom.urlReplace(res,
            '.albumCover img[src*="/serve/"]',
            /\/serve\/.*\//,
            '/serve/_/',
            ':eq(0)'
        );
        hoverZoom.urlReplace(res,
            '.albumCover img[src*="amazon.com"]',
            /(\/[^\.]+)[^\/]+\.(\w+)$/,
            '$1.$2',
            ':eq(0)'
        );

        // /123x456/ -> /
        var reNxN = /\/\d+[xX]\d+\//;
        hoverZoom.urlReplace(res,
            'img[src]',
            reNxN,
            '/'
        );

        // /avatar300s -> /
        var reAvatar=/\/[a-zA-Z]{0,}\d+s\//;
        hoverZoom.urlReplace(res,
            'img[src]',
            reAvatar,
            '/'
        );

        // /arG/ -> /
        var reARG=/\/arG\//;
        hoverZoom.urlReplace(res,
            'img[src]',
            reARG,
            '/'
        );

        $('[style*=background]').each(function() {
            var link = $(this);
            // extract url from style
            var backgroundImage = this.style.backgroundImage;
            if (backgroundImage.indexOf("url") != -1) {
                var reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
                backgroundImage = backgroundImage.replace(reUrl, '$1');
                // remove leading & trailing quotes
                var backgroundImageUrl = backgroundImage.replace(/^['"]/,"").replace(/['"]+$/,"");

                $([reNxN, reAvatar, reARG]).each(function() {

                    var fullsizeUrl = backgroundImageUrl.replace(this, '/');
                    if (fullsizeUrl != backgroundImageUrl) {

                        if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                        if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                            link.data().hoverZoomSrc.unshift(fullsizeUrl);
                            res.push(link);
                        }
                    }
                });
            }
        });

        callback($(res), this.name);
    }
});
