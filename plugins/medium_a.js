var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Medium_a',
    version:'1.0',
    prepareImgLinks:function (callback) {

        var name = this.name;
        var res = [];

        // samples:
        // https://cdn-images-1.medium.com/fit/t/800/240/1*CWl19R2s2gM5u5NcMEP8oA.jpeg -> https://cdn-images-1.medium.com/1*CWl19R2s2gM5u5NcMEP8oA.jpeg
        // https://miro.medium.com/max/700/1*tNWGLkRt1qW3_aW5WiGb5Q.jpeg -> https://miro.medium.com/1*tNWGLkRt1qW3_aW5WiGb5Q.jpeg

        hoverZoom.urlReplace(res,
            'img[src*="medium.com/"]',
            /\/(max|fit)\/.*\//,
            '/'
        );

        callback($(res), name);
    }
});
