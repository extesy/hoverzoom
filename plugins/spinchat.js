var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Spinchat',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        
        hoverZoom.urlReplace(res,
            'img[src*="/mini/"]',
            '/mini/',
            '/full/'
        );
        
        hoverZoom.urlReplace(res,
            'img[src]',
            '/image/1/0/user/',
            '/user/full/'
        );
        
        callback($(res), this.name);
    }
});
