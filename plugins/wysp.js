var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Wysp.ws',
    version:'1.1',
    prepareImgLinks:function (callback) {

        var res = [];

        hoverZoom.urlReplace(res,
            'img[src]',
            /(.*)\/thumbs\/(.*)-th\.(.*)/,
            '$1/posts/$2v3.$3'
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            '/users/avatars/',
            '/users/'
        );

        callback($(res), this.name);
    }
});