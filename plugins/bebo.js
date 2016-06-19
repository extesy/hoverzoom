var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Bebo',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        $('img[src*="/small/"], img[src*="/medium/"], img[src*="/mediuml/"]').each(function () {
            var url,
                img = $(this),
                link = $(this.parentElement).find('a[href*="/large/"]');
            if (link.length) {
                url = link.attr('href');
            } else {
                url = this.src.replace(/\/(small|medium|mediuml)\//, '/large/').replace(/(s|m|ml)\./, 'l.');
            }
            img.data().hoverZoomSrc = [url];
            res.push(img);
        });
        callback($(res));
    }
});