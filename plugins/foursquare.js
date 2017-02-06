var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'foursquare.com',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];   
        
        hoverZoom.urlReplace(res,
            'img[src]',
            /\/\d+x\d+\//,
            '/original/'
        );
        
        hoverZoom.urlReplace(res,
            'div[style*="background"]',
            /\/\d+x\d+\//,
            '/original/'
        );
                
        callback($(res));
    }
});