// Copyright (c) 2010 Romain Vallet
// Licensed under the MIT license, read license.txt
// Contributed by Thomas Efer

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Stern.de',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img',
            [ /_maxpane_\d+_\d+[.]jpg/ , /_fitin_\d+_\d+[.]jpg/ ],
            [ '_maxsize_735_490.jpg' , '_maxsize_735_490.jpg' ]
        );
        callback($(res));
    }
});