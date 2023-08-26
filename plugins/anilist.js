var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'anilist',
    version:'1.0',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample: https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx159831-TxAC0ujoLTK6.png
        $('img[src*="/anilistcdn/media/"]').each(function() {
            const img = $(this), src = img.attr('src');
            img.data().hoverZoomSrc = [src];
            img.addClass('hoverZoomLink');
            res.push(img);
        });

        callback($(res), this.name);
    }
});
