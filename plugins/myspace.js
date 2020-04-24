var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'MySpace',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'a img[src*="ac-images.myspacecdn.com"], a img[src*="images.socialplan.com"]',
            [/\/[sm]_/, '_t.'],
            ['/l_', '_p.']
        );

        // /300x300.jpg -> /full.jpg
        var reNxN = /\/\d+[xX]\d+\./;
        hoverZoom.urlReplace(res,
            'img[src]',
            reNxN,
            '/full.'
        );

        callback($(res));
    }
});