var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Nofrag',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src*="-preview"]',
            '-preview',
            ''
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            /-\d+x\d+\./,
            '.'
        );

        callback($(res), this.name);
    }
});
