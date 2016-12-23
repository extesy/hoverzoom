var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'fotoblur.com',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];   
    
        hoverZoom.urlReplace(res,
            'img[src*="sm_"], img[src*="st_"]',
            ['sm_', 'st_'],
            ['', '']
        );
        
        //ex:
        // <img src="/api/resize?id=906699&dim=224&v=0"     <--- small size:  224x224
        // <img src="/api/resize?id=906699&dim=1000&v=0"    <--- large size: 1000x1000
        hoverZoom.urlReplace(res,
            'img[src*="/api/resize?"]',
            /(.*dim=)(\d+)(.*)/,
            '$1'+1000+'$3'
        );
        
        callback($(res));
    }
});