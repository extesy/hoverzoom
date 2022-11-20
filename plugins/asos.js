var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Asos.com',
    version:'0.2',
    favicon:'asos.svg',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="/inv/"]',
            /image(\d+)[ls]\.jpg/,
            'image$1xxl.jpg'
        );
        hoverZoom.urlReplace(res,
            'img[src*="_small."], img[src*="_medium."], img[src*="_large."], img[src*="_threeacross."]',
            /_(small|medium|large|threeacross)\./,
            '_huge.'
        );
        hoverZoom.urlReplace(res,
            'img[src*="icon_"], img[src*="small_"], img[src*="medium_"]',
            /(icon|small|medium)_(\d+_)?/,
            'large_'
        );
        hoverZoom.urlReplace(res,
            'img[src]',
            /(\?.*)/,
            '?wid=3000&fit=constrain'
        );
        callback($(res), this.name);
    }
});