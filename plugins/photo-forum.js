var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'photo-forum.net',
    version:'2.0',
    prepareImgLinks:function (callback) {

        var res = [];       

        hoverZoom.urlReplace(res,
            'img[src]',
            ['_small', '_middle'],
            ['_original', '_original']
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            ['/site_thumbs/', '/imgs_thumbs/', '/imgs_thumbs_200/', '/imgs_thumbs_big/', '/thumbs/', '_thumb'],
            ['/site_pics/', '/static/site_pics/', '/static/site_pics/', '/static/site_pics/', '', '_big']
        );
        
        $('[style*=background]').each(function() {
            // extract url from style
            var backgroundImage = this.style.backgroundImage;
            if (backgroundImage.indexOf("url") != -1) {
                var reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
                backgroundImage = backgroundImage.replace(reUrl, '$1');
                // remove leading & trailing quotes
                var backgroundImageUrl = backgroundImage.replace(/^['"]/,"").replace(/['"]+$/,"");
                
                var fullsizeUrl = backgroundImageUrl.replace('/site_thumbs/', '/site_pics/').replace('/imgs_thumbs/', '/static/site_pics/').replace('/imgs_thumbs_200/', '/static/site_pics/').replace('/imgs_thumbs_big/', '/static/site_pics/').replace('/thumbs/', '').replace('_thumb.', '_big.');
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