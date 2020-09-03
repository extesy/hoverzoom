var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'gettyimages.com',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];   
        var regex = /(.*)\?(.*)/;
        var patch = '$1?s=2048x2048';
    
        hoverZoom.urlReplace(res,
            'img[src]',
            regex,
            patch
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
                var fullsizeUrl = backgroundImageUrl.replace(regex, patch);
                if (fullsizeUrl != backgroundImageUrl) {

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