// Copyright (c) 2011 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

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
