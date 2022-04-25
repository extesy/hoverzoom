var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'pikwizard',
    version:'1.0',
    prepareImgLinks:function (callback) {

        var res = [];

        hoverZoom.urlReplace(res,
            'img[src]',
            /-[a-z]{1}\./,
            '-l.'
        );

        callback($(res), this.name);
    }
});
