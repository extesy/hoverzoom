var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'fanart.tv',
    version:'1.0',
    prepareImgLinks:function (callback) {

        var res = [];       

        hoverZoom.urlReplace(res,
            'img[src]',
            /\/thumb\.php\?src=\/(.*)&(.*)/,
            '/$1'
        );

        callback($(res), this.name);
    }
});