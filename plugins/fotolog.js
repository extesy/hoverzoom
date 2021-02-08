var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Fotolog',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [],
            filter = 'img[src*="_t."], img[src*="_m."]',
            search = /_(t|m)\./;
        hoverZoom.urlReplace(res, filter, search, '.');
        hoverZoom.urlReplace(res, filter, search, '_f.');
        
         hoverZoom.urlReplace(res,
            'img[src]',
            /-\d+x\d+/,
            ''
        );
        
        callback($(res), this.name);
    }
});
