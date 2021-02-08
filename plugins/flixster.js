var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Flixster',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        
        hoverZoom.urlReplace(res,
            'a img[src*="_tmb."]:not([src*="/critic/"]), a img[src*="_msq."], a img[src*="_pro."]',
            /_(tmb|msq|pro)\./,
            '_gal.'
        );
        
        //sample url: https://resizing.flixster.com/IaXbRF4gIPh9jireK_4VCPNfdKc=/300x0/v2/https://flxt.tmsimg.com/v9/AllPhotos/488370/488370_v9_ba.jpg
        // -> https://flxt.tmsimg.com/v9/AllPhotos/488370/488370_v9_ba.jpg
        var reShorten = /(.*)http(.*)/;
        hoverZoom.urlReplace(res,
            'img[src]',
            reShorten,
            'http$2'
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
                
                $([reShorten]).each(function() {
              
                    var fullsizeUrl = backgroundImageUrl.replace(this, 'http$2');
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