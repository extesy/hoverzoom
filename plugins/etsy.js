var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Etsy',
    version:'0.3',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src], [style*=url], li.listing a',
            /_\d+x\d+\./,
            '_fullxfull.'
        );

        callback($(res), this.name);
    }
});
