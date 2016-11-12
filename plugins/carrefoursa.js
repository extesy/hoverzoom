var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Carrefour SA',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="/mnresize/"]',
            /\/mnresize\/\d+\/\d+\//,
            options.showHighRes ? '/' : '/mnresize/1000/1000/'
        );
        callback($(res));
    }
});
