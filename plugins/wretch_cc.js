// Copyright (c) 2010 Romain Vallet
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Wretch.cc',
    version:'0.1',
    prepareImgLinks:function (callback) {
        // Disabled for now due to a copy protection added by wretch.cc
        /*var res = [];
         hoverZoom.urlReplace(res,
         'a img',
         '/thumbs/t',
         '/'
         );
         callback($(res));*/
    }
});