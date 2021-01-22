var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'VoxMedia',
    version:'1.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample url : https://cdn.vox-cdn.com/thumbor/STr6lo0PAsW5wAFSwqoqMVma7YY=/0x109:2400x1459/250x141/filters:format(webp)/cdn.vox-cdn.com/uploads/chorus_image/image/67425665/GettyImages_1228422156.0.jpg
        //           -> https://cdn.vox-cdn.com/uploads/chorus_image/image/67425665/GettyImages_1228422156.0.jpg
        hoverZoom.urlReplace(res,
            'img[src*="cdn.vox-cdn.com"]',
            /.*(cdn.vox-cdn.com.*)/,
            'https://$1'
        );

        callback($(res), this.name);
    }
});
