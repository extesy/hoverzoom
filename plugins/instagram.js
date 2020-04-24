var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'instagram',
    prepareImgLinks: function (callback) {
        $('body').on('mouseenter', 'div[role="button"], a[href*="/p/"]', function () {
            var elem = $(this);
            // if (elem.parents('ul').length === 1) elem = $(elem.parents('ul')[0]);
            var images = elem.find('img');
            if (images.length === 0) return;

            var res = [];
            images.each(function() {
                var img = $(this);
                var srcset = img.attr('srcset');
                if (!srcset) return;
                var urls = srcset.replace(/\s+[0-9]+(\.[0-9]+)?[wx]/g, '').split(/,/);
                var url = urls[urls.length - 1];
                res.push(url);
            });
            if (res.length === 0) {
                return;
            } else if (res.length === 1) {
                elem.data().hoverZoomSrc = res;
            } else {
                elem.data().hoverZoomGalleryIndex = 0;
                elem.data().hoverZoomGallerySrc = [res];
            }
            elem.addClass('hoverZoomLink');
            hoverZoom.displayPicFromElement(elem);
        });
    },
});
