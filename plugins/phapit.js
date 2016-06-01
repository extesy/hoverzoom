var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Phapit.com',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a[href*="phapit.com/image/"]',
            /.*\/(phap\d*)(\/.*)?/,
            'http://images.phapit.com/uploaded_pics/$1.jpg'
        );
        if (res.length) {
            callback($(res));
        }
    }
});
