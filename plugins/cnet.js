// Copyright (c) 2010 Romain Vallet
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'CNET',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [],
            filter1 = /^(.*)_\d+x\d+\.(jpg|png|gif).*$/i,
        //filter2 = /^(.*\/cnwk\..*\/\d+-\d+)-\d+-(.*)\.(jpg|png|gif).*$/i,
            imgs = $('a img[src*="i.com.com"]');

        imgs.each(function () {
            var img = $(this),
                src = img.attr('src'),
                link = img.parents('a:eq(0)');
            if (src.match(filter1)) {
                src = src.replace(filter1, '$1.$2');
                link.data().hoverZoomSrc = [src];
            }
            /*else if (src.match(filter2)) {
             var srcs = [src.replace(filter2, '$1-440-$2.$3'),
             src.replace(filter2, '$1-200-$2.$3'),
             src.replace(filter2, '$1-160-$2.$3')];
             link.data().hoverZoomSrc = srcs;
             }*/
            res.push(link);
        });

        callback($(res));
    }
});