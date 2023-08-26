var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Freeimage Host',
    version:'1.0',
    prepareImgLinks:function (callback) {
        var res = [];

        // thumbnail: https://iili.io/HyzgrgI.md.jpg
        // fullsize:  https://iili.io/HyzgrgI.jpg
        hoverZoom.urlReplace(res,
            'img[src]',
            '.md.',
            '.'
        );

        callback($(res), this.name);
    }
});
