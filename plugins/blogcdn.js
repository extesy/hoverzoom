var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'BlogCdn',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="blogcdn.com"]',
            [/_\d+x\d+\./, '_thumbnail'],
            ['.', '']
        );
        hoverZoom.urlReplace(res, 'img[src]', /(http.*)(http.*)/ , '$2');
        callback($(res));
    }
});