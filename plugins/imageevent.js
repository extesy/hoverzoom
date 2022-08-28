var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'imageevent.com',
    version:'1.1',
    prepareImgLinks:function (callback) {

        var res = [];

        // page with samples: https://imageevent.com/powerwagon/doorart
        // thumbnail: https://photos.imageevent.com/powerwagon/doorart/icons/phillips_stores.jpg
        // fullsize: https://photos.imageevent.com/powerwagon/doorart/phillips_stores.jpg
        hoverZoom.urlReplace(res,
            'img[src]',
            ['/large/', '/icons/', '/small/', '/websize/'],
            ['/', '/', '/', '/'],
            'a'
        );

        callback($(res), this.name);
    }
});