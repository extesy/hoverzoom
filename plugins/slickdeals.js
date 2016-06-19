var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'slickdeals',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src$=".thumb"]',
            [/\/\d+x\d+\//, '.thumb'],
            ['/', '.attach']
        );

        $('body').on('mouseenter', 'img[src$=".thumb"]', function() {
            var img = $(this);
            var url = img.attr('src').replace(/\/\d+x\d+\//, '/').replace('.thumb', '.attach');
            img.data().hoverZoomSrc = [url];
            img.addClass('hoverZoomLink');
            hoverZoom.displayPicFromElement(img);
        });

        callback($(res));
    }
});
