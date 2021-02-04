var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'3dtotal.com',
    version:'0.3',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src]',
            /\/gallery_.*?\//,
            '/gallery_originals/'
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            /\.(card|expanded|image|large|medium|small|thumb)\..+/,
            '.jpg'
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            /\.(card|expanded|image|large|medium|small|thumb)\..+/,
            '.png'
        );

        hoverZoom.urlReplace(res,
            'div[style*="background"]',
            /\/gallery_.*?\//,
            '/gallery_originals/'
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
                var reFullsize = /\.(card|expanded|image|large|medium|small|thumb)\..+/
                $(['.jpg','.png']).each(function() {
                    var extension = this.toString();
                    var fullsizeUrl = backgroundImageUrl.replace(reFullsize,extension);
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