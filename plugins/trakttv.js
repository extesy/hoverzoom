var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'trakt.tv',
    version:'0.1',
    prepareImgLinks:function (callback) {
        // https://walter.trakt.tv/images/shows/000/189/717/posters/thumb/95911acafb.jpg.webp
        // https://walter.trakt.tv/images/shows/000/189/717/posters/full/95911acafb.jpg.webp
        var res = [];
        $('body').on('mouseenter', 'img.real[src*="/thumb/"]', function() {
            const img = $(this);
            const src = img.attr('src').replace("thumb", "full");
            hoverZoom.prepareLink(img.parent(), src);
        })
        callback($(res));
    }
});
