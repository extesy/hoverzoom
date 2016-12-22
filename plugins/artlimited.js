var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'artlimited.net',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];   
    
        hoverZoom.urlReplace(res,
            'img[src*="artlimited.net"]',
            ['_s', '_m'],
            ['', '']
        );
        callback($(res));
    }
});