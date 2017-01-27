var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'cgsociety.org',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];   
        
        hoverZoom.urlReplace(res,
            'img[src]',
            ['_300.', '_600.', '_large.'],
            ['_orig.', '_orig.', '_orig.']
        );
        
         hoverZoom.urlReplace(res,
            'div[style*="background"]',
            ['_300.', '_600.', '_large.'],
            ['_orig.', '_orig.', '_orig.']
        );
                
        callback($(res));
    }
});