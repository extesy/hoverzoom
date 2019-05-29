var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Wallhaven.cc',
    version:'2.0',
    prepareImgLinks:function (callback) {

        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="/th.wallhaven.cc/"]',
            /\/th.wallhaven.cc\/small\/(.*)\/(.*)\.(.*)$/,
            '/w.wallhaven.cc/full/$1/wallhaven-$2.jpg'
        );
        hoverZoom.urlReplace(res,
            'img[src*="/th.wallhaven.cc/"]',
            /\/th.wallhaven.cc\/small\/(.*)\/(.*)\.(.*)$/,
            '/w.wallhaven.cc/full/$1/wallhaven-$2.png'
        );
        callback($(res));
    }
});