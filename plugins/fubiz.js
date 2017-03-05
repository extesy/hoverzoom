var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'fubiz.net',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src]',
            /-\d+x\d+\./,
            '.'
        );
        
         hoverZoom.urlReplace(res,
            'a[style*="background"]',
            /-\d+x\d+\./,
            '.'
        );

        callback($(res));
    }
});