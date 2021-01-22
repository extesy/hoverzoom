var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'photoforum.ru',
    version:'1.0',
    prepareImgLinks:function (callback) {
        var res = [];   

        hoverZoom.urlReplace(res,
            'img[src]',
            ['.th/', '.th.', '.thsq/', '.thsq.'],
            ['/', '.', '/', '.']
        );

        callback($(res), this.name);
    }
});