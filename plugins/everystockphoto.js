var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'everystockphoto.com',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];   
    
        hoverZoom.urlReplace(res,
            'img[src]',
            ['_tn.', '_m.'],
            ['_l.', '_l.']
        );    
    
        hoverZoom.urlReplace(res,
            'img[src]',
            ['_tn.', '_m.', '_l.'],
            ['_h.', '_h.', '_h.']
        );
        
        hoverZoom.urlReplace(res,
            'img[src]',
            ['_tn.', '_m.', '_l.', '_h.'],
            ['_o.', '_o.', '_o.', '_o.']
        );
        
        hoverZoom.urlReplace(res,
            'img[src]',
            ['-tn.', '-m.'],
            ['-l.', '-l.']
        );    
    
        hoverZoom.urlReplace(res,
            'img[src]',
            ['-tn.', '-m.', '-l.'],
            ['-h.', '-h.', '-h.']
        );
        
        hoverZoom.urlReplace(res,
            'img[src]',
            ['-tn.', '-m.', '-l.', '-h.'],
            ['-o.', '-o.', '-o.', '-o.']
        );
                
        callback($(res));
    }
});