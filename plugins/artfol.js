var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'artstation.com',
    version:'0.2',

    prepareImgLinks: function (callback) {
        const res = [];
        $('a[href*="a/"][title]:not(.hoverZoomMouseover)').each(function() {
            let img = $(this);
            let src = img[0].innerHTML.match(/\/medium(.*\.jpg)/)[1];

            img.data().hoverZoomSrc = ['https://www.artfol-image.me' + src];
            res.push(img);
        });

        callback($(res), this.name);
    }
});
