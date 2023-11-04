var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'findagrave',
    version:'1.0',
    prepareImgLinks:function (callback) {

        var name = this.name;
        var res = [];

        // thumb: https://images.findagrave.com/photoThumbnails/photos/2023/198/51548785_45e6ce5e-67af-42d9-863f-e8f5e508a30c.jpeg
        // full:  https://images.findagrave.com/photos/2023/198/51548785_45e6ce5e-67af-42d9-863f-e8f5e508a30c.jpeg
        hoverZoom.urlReplace(res,
            'img[src]',
            /findagrave\.com\/.*\/photos\//,
            'findagrave.com/photos/'
        );

        callback($(res), name);
    }
});
