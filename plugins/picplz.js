var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'picplz',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [],
            search = /(_\d+r|_t\d+s)/,
            filter = 'img[src*="picplzthumbs.com"]';
        hoverZoom.urlReplace(res,
            filter,
            search,
            '_mmed'
        );
        hoverZoom.urlReplace(res,
            filter,
            [search, /_(meds|smal)/],
            ['_wmeg', '_larg']
        );
        callback($(res));
    }
});
