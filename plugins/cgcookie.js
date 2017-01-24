var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'cgcookie.com',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];   
        
        hoverZoom.urlReplace(res,
            'img[src*="cgcookie"]',
            /(.*)-(\d+)x(\d+)\./,
            '$1.'
        );
        
        hoverZoom.urlReplace(res,
            'div[style*="background"]',
            /(.*)-(\d+)x(\d+)\./,
            '$1.'
        );
                
        callback($(res));
    }
});