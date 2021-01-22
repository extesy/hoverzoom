var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'ImageShack',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a[href*="imageshack.us/my.php"], a[href*="imageshack.us/i/"]',
            /img(\d+)\.imageshack\.us\/(?:i\/|my\.php\?image=)([\w\.]+).*$/,
            'desmond.imageshack.us/Himg$1/scaled.php?server=$1&filename=$2&res=medium'
        );
        hoverZoom.urlReplace(res,
            'a[href*="imageshack.us/photo/my-images"]',
            /imageshack\.us\/photo\/my-images\/(\d+)\/([^\/]+)\/$/,
            'desmond.imageshack.us/Himg$1/scaled.php?server=$1&filename=$2&res=medium'
        );
        hoverZoom.urlReplace(res,
            'a[href*="imageshack.us/f/"]',
            /imageshack\.us\/f\/(\d+)\/([^\/]+)\/$/,
            'desmond.imageshack.us/Himg$1/scaled.php?server=$1&filename=$2&res=medium'
        );

        var reNxNqN=/\/[\d]{0,}x[\d]{0,}q?[\d]{0,}\//;
        hoverZoom.urlReplace(res,
            'img[src*="imageshack"]',
            reNxNqN,
            '/q100/'
        );

        $('[style*=background]').each(function() {
            var link = $(this);
            // extract url from style
            var backgroundImage = this.style.backgroundImage;
            if (backgroundImage.indexOf("url") != -1 && backgroundImage.indexOf("imageshack") != -1) {
                var reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
                backgroundImage = backgroundImage.replace(reUrl, '$1');
                // remove leading & trailing quotes
                var backgroundImageUrl = backgroundImage.replace(/^['"]/,"").replace(/['"]+$/,"");

                $([reNxNqN]).each(function() {

                    var fullsizeUrl = backgroundImageUrl.replace(this, '/q100/');
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
