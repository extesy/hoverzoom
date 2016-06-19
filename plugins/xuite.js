var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Xuite',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        $('a.hoverZoomLink[href*="photo.xuite.net"], a.hoverZoomLink[href^="/"]').removeClass('hoverZoomLink');
        hoverZoom.urlReplace(res,
            'a img[src*="photo.xuite.net"]',
            /_[a-km-w]\./i,
            options.showHighRes ? '_x.' : '_l.',
            ':eq(0)'
        );
        callback($(res));
    }
});
