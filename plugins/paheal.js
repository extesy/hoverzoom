var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Paheal.net',
    version:'0.1',
    prepareImgLinks:function (callback) {
        let res = [];

        $('img[src*="thumbs"]').each(function() {
            let img = $(this);
            let src = 'https://rule34.paheal.net' + img.attr('src');

            src = src.replace('thumbs', 'images').replace('thumb', 'image').replace(/jpg$/, '');
            img.data().hoverZoomSrc = [src + 'jpg', src + 'mp4'];
            res.push(img);
        });

        callback($(res), this.name);
    }
});
