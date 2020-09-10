var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Picturepush.com',
    version:'1.0',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src]',
            /(.*)\/photo\/a\/(\d+)\/(.*)\/(.*)/,
            '$1/photo/a/$2/1024/$4'
        );
        callback($(res), this.name);
    }
});
