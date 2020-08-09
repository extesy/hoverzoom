var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Amazon',
    version:'0.3',
    prepareImgLinks:function (callback) {
        var res = [];

        var reFullsize = /(.*)\/(.*?)\.([^\/]*?)\.(gif|jpe?g|png)$/;
        var reReplace = '$1/$2.$4';

        hoverZoom.urlReplace(res,
            'img[src]',
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

        callback($(res));
    }
});