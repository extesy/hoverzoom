var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'istockphoto.com',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];   
    
        hoverZoom.urlReplace(res,
            'img[src*="istockphoto.com/photos/"], img[src*="istockphoto.com/vectors/"], img[src*="istockphoto.com/illustrations/"]',
            /\?.*/,
            '?s=2048x2048'
        );
                
        callback($(res));
    }
});