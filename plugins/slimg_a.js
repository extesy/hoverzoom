var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'sli.mg',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a[href*="/sli.mg/"]',
            /\/sli\.mg\/(\w{6})(\?|$)/,
            '/i.sli.mg/$1.jpg'
        );
        hoverZoom.urlReplace(res,
            'a img[src*="/i.sli.mg/"]',
            /\/(\w{6})\.ms\./,
            '/$1.'
        );
        callback($(res));
    }
});
