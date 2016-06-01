var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Bluray',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="/covers/"]',
            /(large|medium|small)/,
            'front'
        );
        hoverZoom.urlReplace(res,
            'img[src*="_tn."]',
            '_tn.',
            '_large.'
        );
        callback($(res));
    }
});