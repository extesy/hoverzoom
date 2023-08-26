var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'slickdeals',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src$=".thumb"]',
            [/\/\d+x\d+\//, '.thumb'],
            ['/', '.attach']
        );

        $('body').on('mouseenter', 'img[src$=".thumb"]', function() {
            const img = $(this);
            const url = img.attr('src').replace(/\/\d+x\d+\//, '/').replace('.thumb', '.attach');
            img.data().hoverZoomSrc = [url];
            img.addClass('hoverZoomLink');
            hoverZoom.displayPicFromElement(img);
        });

        $('body').on('mouseenter', 'span.dealCardList__dealImageContainer, a.bp-c-card_imageContainer', function() {
            const self = $(this);
            const img = self.find('img');
            if (img.length === 1) {
                const url = img.attr('src').replace(/\/\d+x\d+\//, '/').replace('.thumb', '.attach');
                self.data().hoverZoomSrc = [url];
                self.addClass('hoverZoomLink');
                hoverZoom.displayPicFromElement(self);
            }
        });

        callback($(res), this.name);
    }
});
