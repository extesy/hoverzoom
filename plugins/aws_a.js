var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'AWS_a',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src*="amazonaws"],[style*="amazonaws"]',
            /\?.*/,
            ''
        );

        callback($(res), this.name);
    }
});