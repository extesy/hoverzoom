var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'artsper.com',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];   
        
        hoverZoom.urlReplace(res,
            'img[src*="artsper"]',
            ['_p.', '_s.', '_m.', '_f.', '_grid.'],
            ['_l.', '_l.', '_l.', '_l.', '_l.']
        );
                
        callback($(res));
    }
});