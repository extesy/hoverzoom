var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Wallhaven.cc',
    version:'2.0',
    prepareImgLinks:function (callback) {

        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="/th.wallhaven.cc/"]',
            /\/th.wallhaven.cc\/(.*)\/(.*)\/(.*)\.(.*)$/,
            '/w.wallhaven.cc/full/$2/wallhaven-$3.jpg'
        );
        hoverZoom.urlReplace(res,
            'img[src*="/th.wallhaven.cc/"]',
            /\/th.wallhaven.cc\/(.*)\/(.*)\/(.*)\.(.*)$/,
            '/w.wallhaven.cc/full/$2/wallhaven-$3.png'
        );
        callback($(res));
    }
});