var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Safebooru',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src]',
            /(.*)\/(?:thumbnails|samples)\/(.*)\/(?:thumbnail|sample)_(.*)\.jpg(.*)/,
            '$1/images/$2/$3.png'
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            /(.*)\/(?:thumbnails|samples)\/(.*)\/(?:thumbnail|sample)_(.*)\.jpg(.*)/,
            '$1/images/$2/$3.jpeg'
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            /(.*)\/(?:thumbnails|samples)\/(.*)\/(?:thumbnail|sample)_(.*)/,
            '$1/images/$2/$3'
        );

        callback($(res), this.name);
    }
});
