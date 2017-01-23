var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'smugmug.com',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];   
        
        hoverZoom.urlReplace(res,
            'img[src*="smugmug"]',
            /(.*)\/(.*)\/([^\/].*)-([^-].*)\./,
            '$1/O/$3.'
        );
        
         hoverZoom.urlReplace(res,
            'a[style*="background"]',
            /(.*)\/(.*)\/([^\/].*)-([^-].*)\./,
            '$1/O/$3.'
        );
                
        callback($(res));
    }
});