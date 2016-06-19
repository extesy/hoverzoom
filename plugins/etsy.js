var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Etsy',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="/il_"], li.listing a',
            /il_\d+x\d+./,
            options.showHighRes ? 'il_fullxfull.' : 'il_570xN.'
        );
        callback($(res));
    }
});
