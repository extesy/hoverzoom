var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'mobypicture.com',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];   
        
        hoverZoom.urlReplace(res,
            'img[src*="mobypicture"]',
            ['_small.', '_square.', '_view.'],
            ['_large.', '_large.', '_large.']
        );     
                
        callback($(res));
    }
});