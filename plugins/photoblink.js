var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'photoblink.com',
    version:'1.0',
    prepareImgLinks:function (callback) {

        var res = [];       

        hoverZoom.urlReplace(res,
            'img[src]',
            /\/th\/(.*)_thumb(.*)\.(.*)/,
            '/im/$1.$3'
        );

        callback($(res), this.name);
    }
});