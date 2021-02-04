var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Copains d avant',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        
        var re = /\/image\/\d+\//;
        
        hoverZoom.urlReplace(res,
            'img[src*="image-uniservice"]',
            re,
            '/image/2000/'
        );
        
        hoverZoom.urlReplace(res,
            'img[src*="image-parcours"]',
            re,
            '/image/2000/'
        );
        
        hoverZoom.urlReplace(res,
            'figure[style*="background-image"]',
            re,
            '/image/2000/'
        );
        
        $('[style*=background-image]').each(function() {
            var link = $(this);
            // extract url from style
            var backgroundImage = this.style.backgroundImage;
            if (backgroundImage.indexOf("url") != -1) {
                var reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
                backgroundImage = backgroundImage.replace(reUrl, '$1');
                // remove leading & trailing quotes
                var backgroundImageUrl = backgroundImage.replace(/^['"]/,"").replace(/['"]+$/,"");
                
                $([re]).each(function() {
              
                    var fullsizeUrl = backgroundImageUrl.replace(this, '/image/2000/');
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