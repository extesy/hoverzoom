var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'MemeDad',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a[href*="memedad.com/meme/"]',
            /\/meme\/(\d+)/,
            '/memes/$1.jpg'
        );
        callback($(res));
    }
});
