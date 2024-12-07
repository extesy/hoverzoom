var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'rule34',
    version:'1.0',
    prepareImgLinks:function (callback) {

        var res = [];

        // images
        // thumbnail: https://wimg.rule34.xxx/thumbnails/5865/thumbnail_0e4386ce2217951233a1272ec3d43ba0ab8592b0.jpg
        // fullsize:  https://wimg.rule34.xxx/images/5865/0e4386ce2217951233a1272ec3d43ba0ab8592b0.png
        hoverZoom.urlReplace(res,
            'img[src]:not([style])',
            /\/(thumbnails|samples)\/\/?(\d+)\/\/?(thumbnail|sample)_(.*)\.(.*)/,
            '/images/$2/$4.gif'
        );
        hoverZoom.urlReplace(res,
            'img[src]:not([style])',
            /\/(thumbnails|samples)\/\/?(\d+)\/\/?(thumbnail|sample)_(.*)\.(.*)/,
            '/images/$2/$4.jpg'
        );
        hoverZoom.urlReplace(res,
            'img[src]:not([style])',
            /\/(thumbnails|samples)\/\/?(\d+)\/\/?(thumbnail|sample)_(.*)\.(.*)/,
            '/images/$2/$4.png'
        );
        hoverZoom.urlReplace(res,
            'img[src]:not([style])',
            /\/(thumbnails|samples)\/\/?(\d+)\/\/?(thumbnail|sample)_(.*)\.(.*)/,
            '/images/$2/$4.jpeg'
        );

        // videos
        // thumbnail (poster): https://wimg.rule34.xxx/thumbnails/5866/thumbnail_332f750db8eb0a5e1df93666b55428d6.jpg
        // video:              https://wimg.rule34.xxx/images/5866/332f750db8eb0a5e1df93666b55428d6.mp4
        hoverZoom.urlReplace(res,
            'img[src][style]',
            /\/(thumbnails|samples)\/\/?(\d+)\/\/?(thumbnail|sample)_(.*)\.(.*)/,
            '/images/$2/$4.mp4'
        );

        callback($(res), this.name);
    }
});