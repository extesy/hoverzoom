var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'imageevent.com',
    version:'1.0',
    prepareImgLinks:function (callback) {

        var res = [];       

        hoverZoom.urlReplace(res,
            'img[src]',
            ['/large/', '/icons/', '/small/', '/websize/'],
            ['/', '/', '/', '/']
        );

        callback($(res), this.name);
    }
});