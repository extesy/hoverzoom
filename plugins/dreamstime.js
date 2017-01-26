var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'dreamstime.com',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];   
        
        hoverZoom.urlReplace(res,
            'img[src*="dreamstime"]',
            ['/m/', '/s/', '/t/', '/x/'],
            ['/z/', '/z/', '/z/', '/z/']
        );     
                
        callback($(res));
    }
});