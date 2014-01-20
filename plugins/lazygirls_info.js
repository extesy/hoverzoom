// Copyright (c) 2013 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Lazygirls.info',
    prepareImgLinks:function (callback) {
        var res = [],
			repl = document.querySelector('a[href$="sign_up"]') ? '.sized.' : '.';
        hoverZoom.urlReplace(res,
            'img[src*=".thumb."]',
            '.thumb.',
            repl
        );
        callback($(res));
    }
});