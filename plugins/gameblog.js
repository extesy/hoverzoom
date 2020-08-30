var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Gameblog.fr',
    version:'0.3',
    prepareImgLinks:function (callback) {
        var res = [];
        
        hoverZoom.urlReplace(res,
            'img[src*="/tn/"], img[src*="/med/"]',
            /\/(tn|med)\//,
            '/'
        );
        
        hoverZoom.urlReplace(res,
            'img[src*="mygameblog/av"]',
            /.*\/av(\d+)_.*/,
            'http://www.gameblog.fr/forum/uploads/av-$1.jpg'
        );
		
		hoverZoom.urlReplace(res,
            'img[src]',
            ['/hi/', '-thumb'],
            ['/', '']
        );		
		
        callback($(res), this.name);
    }
});
