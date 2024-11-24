var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Etejo',
    version:'0.1',
    prepareImgLinks:function (callback) {
        const res = [];

        // This should work, yet no image shows on hover
        // I suspect Etejo has something preventing it
        $('div.row.gallery.point:not(.hoverZoomMouseover)').addClass('hoverZoomMouseover').one('mouseover', function () {
            const img = $(this);
            const src = 'https://etejo.com/' + img.find('img[src*="Users/"]').attr('src');
            
            hoverZoom.prepareLink(img, src)
        });

        callback($(res), this.name);
    }
});
