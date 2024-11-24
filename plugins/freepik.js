﻿var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Freepik',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        $('a img[src*="/th/"]').each(function() {
            var img = this,
                link = $(this.parentNode),
                url = link.attr('href'),
                imgNum = img.src.match(/th\/(.*)\./)[1];
            url = url.replace(/_\d+\.htm/, '_' + imgNum + '.jpg').replace('//www.', '//static.');
            link.data().hoverZoomSrc = [url];
            res.push(link);
        });
        $('a img[src*="\?size"]').each(function() {
            var img = this,
                link = $(this.parentNode),
                url = img.src;
            url = url.replace(/\?size.*/, '');
            link.data().hoverZoomSrc = [url];
            res.push(link);
        });
        callback($(res), this.name);
    }
});
