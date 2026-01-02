var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'listal',
    version:'0.1',
    prepareImgLinks:function (callback) {

        var pluginName = this.name;
        var res = [];

        // https://www.listal.com/

        // images
        // thumbnail: https://lthumb.lisimg.com/151/31114151.jpg?width=100&sharpen=true
        // fullsize:  https://lthumb.lisimg.com/151/31114151.jpg

        hoverZoom.urlReplace(res,
            'img[src*="lthumb.lisimg.com"]',
            /\?.*/,
            ''
        );

        // images
        // thumbnail: https://list.lisimg.com/image/17105274/700full.jpg
        // fullsize:  https://list.lisimg.com/image/17105274/9999full.jpg

        hoverZoom.urlReplace(res,
            'img[src*="list.lisimg.com"]',
            /\/\d+full(.*)/,
            '/9999full$1'
        );

        // collages
        // thimbnail: https://collage.listal.com/410/9-8737233-8642091-8561037-8471031-8375448.jpg
        // fullsize:  https://collage.listal.com/1600/9-8737233-8642091-8561037-8471031-8375448.jpg

        hoverZoom.urlReplace(res,
            'img[src*="collage.listal.com"]',
            /\/\d+\//,
            '/1600/'
        );

        callback($(res), this.name);
    }
});
