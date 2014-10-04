// Copyright (c) 2013 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'YouTube',
    prepareImgLinks:function (callback) {
        var res = [],
            repl = 'http://i1.ytimg.com/vi/$1/0.jpg';
        $('a[href*="youtu.be/"] img').each(function () {
            var link = $(parentNodeName(this, 'a')),
                img = $(this);
            img.data().hoverZoomSrc = [link.attr('href').replace(/^.*youtu.be\/([\w-]+).*$/, repl)];
            res.push(img);
        });
        $('a[href*="youtube.com/watch"] img').each(function () {
            var link = $(parentNodeName(this, 'a')),
                img = $(this);
            img.data().hoverZoomSrc = [link.attr('href').replace(/^.*v=([\w-]+).*$/, repl)];
            res.push(img);
        });
        hoverZoom.urlReplace(res,
            'img[src*="ytimg.com/vi/"]',
            /\/(\d|default)\.jpg/,
            '/0.jpg'
        );
        $('a img[data-thumb*="ytimg.com/vi/"]').each(function () {
            var img = $(this); 
            img.data().hoverZoomSrc = [this.getAttribute('data-thumb').replace(/\/(\d|default)\.jpg/, '/0.jpg')];
            res.push(img);
        });
        callback($(res));
    }
});