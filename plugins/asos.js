var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Asos.com',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="/inv/"]',
            /image(\d+)[ls]\.jpg/,
            'image$1xxl.jpg'
        );
        hoverZoom.urlReplace(res,
            'img[src*="_medium."]',
            '_medium.',
            '_huge.'
        );
        hoverZoom.urlReplace(res,
            'img[src*="icon_"], img[src*="small_"], img[src*="medium_"]',
            /(icon|small|medium)_(\d+_)?/,
            'large_'
        );
        callback($(res));
    }
});