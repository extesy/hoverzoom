var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Memecrunch',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'a[href*="memecrunch.com/meme/"]:not([href$="image.png"])',
            /(.*)\/?$/,
            '$1/image.png'
        );

        //sample url: http://thumbs9.memecrunch.com/meme/CBWLN/un-cumple-la-patgona-lucia-unas-47-primaveras/image.png?w=92
        // remove ?...
        hoverZoom.urlReplace(res,
            'img[src]',
            /\?.*/,
            ''
        );

        callback($(res));
    }
});
