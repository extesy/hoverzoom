var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'metmuseum.org',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];   
        
        hoverZoom.urlReplace(res,
            'img[src*="metmuseum"]',
            ['mobile-thumb', 'web-thumb', 'mobile-additional', 'web-additional'],
            ['mobile-large', 'web-large', 'mobile-large', 'web-large']
        );
        
        hoverZoom.urlReplace(res,
            'img[src*="metmuseum"]',
            ['mobile-thumb', 'web-thumb', 'mobile-additional', 'web-additional', 'mobile-large', 'web-large'],
            ['original', 'original', 'original', 'original', 'original', 'original']
        );      
                
        callback($(res));
    }
});