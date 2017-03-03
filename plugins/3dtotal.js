var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'3dtotal.com',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];   
        
        hoverZoom.urlReplace(res,
            'img[src*="3dtotal"]',
            /\/gallery_.*?\//,
            '/gallery_originals/'
        );
        
        hoverZoom.urlReplace(res,
            'div[style*="background"]',
            /\/gallery_.*?\//,
            '/gallery_originals/'
        );
                
        callback($(res));
    }
});