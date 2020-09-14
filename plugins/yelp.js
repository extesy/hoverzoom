var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Yelp',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        
        /*hoverZoom.urlReplace(res,
            'img[src]',
            /(.*)\/(.*)(xss|ss|s|m|ms)\./,
            '$1/o.'
        );*/
        
        var re=/(.*)\/.*\.(.*)/;
        hoverZoom.urlReplace(res,
            'img[src]',
            re,
            '$1/o.$2'
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
                
                $([re]).each(function() {
              
                    var fullsizeUrl = backgroundImageUrl.replace(this, '$1/o.$2');
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
