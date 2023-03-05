var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'auscelebs',
    version:'1.0',
    prepareImgLinks:function (callback) {

        var res = [];

        // thumbnail: https://forums.auscelebs.net/acnet-images/99737/thumbs/abbie-chatfield-1517686.jpg
        //  fullsize: https://forums.auscelebs.net/acnet-images/99737/abbie-chatfield-1517686.jpg
        hoverZoom.urlReplace(res,
            'img[src*="/thumbs/"]',
            '/thumbs/',
            '/'
        );

        callback($(res), this.name);
    }
});
