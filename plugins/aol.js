var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'aol.com',
    version:'2.0',
    prepareImgLinks:function (callback) {

        var res = [];
    
        var reFullsize = /(http.*)(http.*?)(&|$)(.*)/;
        var reReplace = '$2';

        hoverZoom.urlReplace(res,
            'a[href], img[src]',
            reFullsize,
            reReplace
        );
        
        $('[style*=url]').each(function() {
            // extract url from style
            var backgroundImage = this.style.backgroundImage;
            var reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            // remove leading & trailing quotes
            var backgroundImageUrl = backgroundImage.replace(/^['"]/, '').replace(/['"]+$/, '');
            var fullsizeUrl = backgroundImageUrl.replace(reFullsize, reReplace);
            if (fullsizeUrl != backgroundImageUrl) {
                var link = $(this);
                if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                    link.data().hoverZoomSrc.unshift(fullsizeUrl);
                    res.push(link);
                }
            }
        });

        // add metadata for CherryPics
        $('a[href*="imgrefurl="]').each(function () {
            var link = $(this),
                href = this.getAttribute('href') || '';
                
            imgUrlIndex = href.indexOf('imgrefurl=');
            href = href.substring(imgUrlIndex + 10, href.indexOf('&', imgUrlIndex));
            link.data().href = unescape(href);
            res.push(link);
        });

        callback($(res), this.name);
    }
});