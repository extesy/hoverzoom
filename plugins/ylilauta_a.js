var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'ylilauta_a',
    version: '1.0',
    prepareImgLinks: function(callback) {

        const pluginName = this.name;
        var res = [];

        // images
        // sample:   https://t.ylilauta.org/jpg/f1/b1/f1b1b198026f2cd0-240.jpg
        // fullsize: https://t.ylilauta.org/f1/b1/f1b1b198026f2cd0.jpg
        hoverZoom.urlReplace(res,
            'img[src*="ylilauta.org/jpg/"]',
            /^.*\/jpg\/(.*?)\/(.*?)\/(.*)-.*/,
            'https://t.ylilauta.org/$1/$2/$3.jpg'
        );

        // images
        // sample:   https://t.ylilauta.org/jpg/f1/b1/f1b1b198026f2cd0-240.jpg
        // fullsize: https://i.ylilauta.org/f1/b1/f1b1b198026f2cd0.jpg
        hoverZoom.urlReplace(res,
            'img[src*="ylilauta.org/jpg/"]',
            /^.*\/jpg\/(.*?)\/(.*?)\/(.*)-.*/,
            'https://i.ylilauta.org/$1/$2/$3.jpg'
        );

        // videos
        // https://t.ylilauta.org/mp4/d8/a9/d8a9ca797cb0e8df-240.jpg
        // https://t.ylilauta.org/d8/a9/d8a9ca797cb0e8df.mp4
        hoverZoom.urlReplace(res,
            'img[src*="ylilauta.org/mp4/"]',
            /^.*\/mp4\/(.*?)\/(.*?)\/(.*)-.*/,
            'https://i.ylilauta.org/$1/$2/$3.mp4'
        );

        callback($(res), pluginName);
    }
});
