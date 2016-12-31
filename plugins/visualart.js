var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'visualart.me',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];   
    
        hoverZoom.urlReplace(res,
            'img[src*="/s1/"]',
            '/s1/',
            '/s2/'
        );
        hoverZoom.urlReplace(res,
            'img[src*="/s4/"]',
            '/53x53/',
            '/180x180/'
        );
        callback($(res));
    }
});