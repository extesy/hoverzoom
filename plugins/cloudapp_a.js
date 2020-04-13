var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'CloudApp',
    prepareImgLinks:function (callback) {
        var res = []
        hoverZoom.urlReplace(res,
            'a[href*="/share\.getcloudapp\.com/"]',
            /.*(?:share\.getcloudapp\.com)\/(?:items\/)*([^\/]+).*/,
            'https://share.getcloudapp.com/items/$1/download'
        );
        hoverZoom.urlReplace(res,
            'a[href*="/cl\.ly/"]',
            /.*(?:cl\.ly)\/((?!download)[^\/]+).*/,
            'https://cl.ly/$1/download'
        );
        callback($(res));
    }
});
