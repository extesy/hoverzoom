var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'vsco.co',
    version:'0.1',
    prepareImgLinks:function (callback) {
        // https://im.vsco.co/aws-us-west-2/949b43/66474950/64e04545c0e8e33f25a126b6/vsco_081823.jpg?w=260
        // https://im.vsco.co/aws-us-west-2/949b43/66474950/64e04545c0e8e33f25a126b6/vsco_081823.jpg
        var res = [];
        $('body').on('mouseenter', 'img[src*="/im.vsco.co/"]', function() {
            const img = $(this);
            const src = img.attr('src');
            const href = src.substring(0, src.indexOf('?'));
            hoverZoom.prepareLink(img, href);
        })
        callback($(res), this.name);
    }
});
