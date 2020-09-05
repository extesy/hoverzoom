var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'JeuxVideo.com',
    version:'0.3',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'a img[src*="_m."]',
            '_m.',
            '.'
        );

        //sample url: http://image.jeuxvideo.com/avatar-sm/0/0/[87]-1424272110-62d78ff2c9f6eb8b75acc27d77d2c987.jpg
        // avatar-sm -> avatar
        var reJV=/(.*)-(lg|sm|md||xs)\/(.*)/;
        hoverZoom.urlReplace(res,
            'img[src]',
            reJV,
            '$1/$3'
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

                $([reJV]).each(function() {

                    var fullsizeUrl = backgroundImageUrl.replace(this, '$1/$3');
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
