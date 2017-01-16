var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'pixabay.com',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];   
    
        hoverZoom.urlReplace(res,
            'img[src*="pixabay"]',
            ['__180', '__340', '__480', '_640', '_960_720', '_48x48'],
            ['_960_720', '_960_720', '_960_720', '_960_720', '_1280', '_96x96']
        );
                
        callback($(res));
    }
});