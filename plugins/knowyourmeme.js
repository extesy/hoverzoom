var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Know Your Meme',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        
        hoverZoom.urlReplace(res,
            'a img.small',
            '/small/',
            '/original/'
        );
        
        hoverZoom.urlReplace(res,
            'img[src]',
            ['/list/', '/masonry/', '/medium/', '/newsfeed/', '/tiny/'],
            ['/original/', '/original/', '/original/', '/original/', '/original/']
        );
        
        callback($(res), this.name);
    }
});
