var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Etejo',
    version:'0.1',
    prepareImgLinks:function (callback) {
        let res = [];

        // This should work, yet no image shows on hover
        // I suspect Etejo has something preventing it
        $('img[src*="Users/"]').one('mouseover', function () {
            let img = $(this);
            let src = img.attr('src');

            img.data().hoverZoomSrc = ['https://etejo.com/' + src];
            res.push(img);
        });

        callback($(res), this.name);
    }
});
