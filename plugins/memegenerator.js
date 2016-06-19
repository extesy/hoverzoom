var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Memegenerator',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a[href*="memegenerator.net/instance/"]',
            /.*instance\/(\d+).*/,
            'http://images.memegenerator.net/instances/500x/$1.jpg'
        );
        callback($(res));
    }
});
