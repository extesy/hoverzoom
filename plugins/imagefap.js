var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Imagefap',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        
        hoverZoom.urlReplace(res,
            'img[src*="/images/"]',
            /(.*)\/images\/(thumb|mini)\/(.*)/,
            '//x.fap.to/images/full/$3'
        );
        
        callback($(res), this.name);
    }
});
