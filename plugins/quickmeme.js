var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Quick Meme',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a[href*="quickmeme.com/meme/"]',
            /^.*\/meme\/(\w+).*$/,
            'http://i.qkme.me/$1.jpg'
        );
        hoverZoom.urlReplace(res,
            'a[href*="qkme.me/"]',
            /^.*qkme.me\/(\w+).*$/,
            'http://i.qkme.me/$1.jpg'
        );
        callback($(res));
    }
});
