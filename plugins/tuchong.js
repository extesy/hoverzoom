var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'tuchong.com',
    version:'2.0',
    prepareImgLinks:function (callback) {

        var res = [];

         hoverZoom.urlReplace(res,
            'img[src]',
            ['/l_', '/l/', '/sm/', '/ms/', '/m/', '/g/', '/ft640/'],
            ['/ll_', '/f/', '/l/', '/l/', '/f/', '/f/', '/f/']
        );

        $('[style*=background]').each(function() {
            // extract url from style
            var backgroundImage = this.style.backgroundImage;
            if (backgroundImage.indexOf("url") != -1) {
                var reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
                backgroundImage = backgroundImage.replace(reUrl, '$1');
                // remove leading & trailing quotes
                var backgroundImageUrl = backgroundImage.replace(/^['"]/,"").replace(/['"]+$/,"");
                var fullsizeUrl = backgroundImageUrl.replace('/l_', '/ll_').replace('/sm/', '/l/').replace('/ms/', '/l/').replace('/m/', '/f/').replace('/l/', '/f/').replace('/g/', '/f/').replace('/ft640/', '/f/');
                if (fullsizeUrl != backgroundImageUrl) {
                    var link = $(this);
                    if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                    if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                        link.data().hoverZoomSrc.unshift(fullsizeUrl);
                        res.push(link);
                    }
                }
            }
        });

        callback($(res), this.name);
    }
});