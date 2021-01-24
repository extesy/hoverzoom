var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'giphy.com',
    version:'2.0',
    prepareImgLinks:function (callback) {

        var res = [];       

        hoverZoom.urlReplace(res,
            'img[src]',
            /\/[12]00w?/,
            '/giphy'
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            ['/200.webp', '/giphy.webp'],
            ['/400h.webp', '/400h.webp']
        );

        callback($(res), this.name);
    }
});