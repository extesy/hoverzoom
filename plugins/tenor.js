var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'tenor',
    version:'0.1',
    prepareImgLinks:function (callback) {
        let res = [];

        hoverZoom.urlReplace(res,
            'img[src*="media"]',
            /media(.*AAAA)M/,
            'c$1d'
        );

        callback($(res), this.name);
    }
});
