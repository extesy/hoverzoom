var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'WDL',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src],[style*=url]',
            /\d+x\d+/,
            '1024x1024'
        );

        callback($(res), this.name);
    }
});
