var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Duitang',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample: https://c-ssl.duitang.com/uploads/blog/202103/13/20210313143250_83033.thumb.300_300_c.jpg
        //      -> https://c-ssl.duitang.com/uploads/blog/202103/13/20210313143250_83033.jpg

        hoverZoom.urlReplace(res,
            'img[src],[style*=url]',
            /\.thumb.*\./,
            '.'
        );

        callback($(res), this.name);
    }
});
