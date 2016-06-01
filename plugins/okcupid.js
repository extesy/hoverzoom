var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'OkCupid',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="/images/"]',
            /\/(\d+x\d+)\/(\d+x\d+)\/(\d+x\d+)\/(\d+x\d+)\/(\d+)/,
            '/$1/558x800/$3/$4/0'
        );
        callback($(res));
    }
});
