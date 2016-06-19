var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Anime Paper',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="/thumbnails/"]',
            /(?:standard|box)\/(small|medium|large|minute)\/(.*)_\1(.*)/,
            'preview\/$2_preview$3'
        );
        hoverZoom.urlReplace(res,
            'img[src*="/user/"]',
            /\/\d{2}\//,
            '/140/'
        );
        callback($(res));
    }
});
