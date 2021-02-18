var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'imgflip',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src*="imgflip"]',
            '/2/',
            '/'
        );

        callback($(res), this.name);
    }
});