var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'photosight.ru',
    version:'1.0',
    prepareImgLinks:function (callback) {

        var res = [];       

        hoverZoom.urlReplace(res,
            'img[src]',
            '_medium',
            '_original'
        );
        
        hoverZoom.urlReplace(res,
            'img[src]',
            ['_crop_1', '_mini', '_thumb', '_large'],
            ['_xlarge', '_xlarge', '_xlarge', '_xlarge']
        );

        $('a[style*=background]').each(function() {
            // extract url from style
            var backgroundImage = this.style.backgroundImage;
            if (backgroundImage.indexOf("url") != -1) {
                var reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
                backgroundImage = backgroundImage.replace(reUrl, '$1');
                // remove leading & trailing quotes
                var backgroundImageUrl = backgroundImage.replace(/^['"]/,"").replace(/['"]+$/,"");
                var reThumb = /_crop_1|_mini|_thumb|_large/
                var fullsizeUrl = backgroundImageUrl.replace(reThumb, '_xlarge');
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