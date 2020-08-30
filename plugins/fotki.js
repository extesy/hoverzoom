var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'fotki.com',
    version:'1.0',
    prepareImgLinks:function (callback) {
        var res = [];   

        hoverZoom.urlReplace(res,
            'img[src]',
            '-th',
            '-vi'
        );

        callback($(res), this.name);
    }
});