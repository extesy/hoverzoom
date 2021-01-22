var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'tripadvisor',
    version:'1.0',
    prepareImgLinks:function (callback) {

        var res = [];

        hoverZoom.urlReplace(res,
            'img[src]',
            ['dynamic-media', /\/\d+x\d+\//, /\/photo-.*?\//, /\/vr-splice-.*?\//],
            ['media', '/', '/photo-o/', '/vr-splice-j/']
        );

        $('[style*=url]').each(function() {
            let link = $(this);
            // extract url from style
            let backgroundImage = this.style.backgroundImage;
            let reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            // remove leading & trailing quotes
            let backgroundImageUrl = backgroundImage.replace(/^['"]/, "").replace(/['"]+$/, "");
            let fullsizeUrl = backgroundImageUrl.replace('dynamic-media', 'media').replace(/\/\d+x\d+\//, '/').replace(/\/photo-.*?\//, '/photo-o/').replace(/\/vr-splice-.*?\//, '/vr-splice-j/');
            if (fullsizeUrl != backgroundImageUrl) {

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
