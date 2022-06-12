var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'GoogleSheets',
    version:'0.2',
    prepareImgLinks: function (callback) {
        $('a[href]').one('mouseover', function() {
            let link = $(this), href = link.attr('href');

            if (link.attr('href').indexOf('//drive.google.com/') !== -1) {
                href = link.closest('#docs-link-bubble').find('img').attr('src');
            }

            if (href && href.indexOf('//drive.google.com/') === -1) {
                link.data().hoverZoomSrc = [href];
                link.addClass('hoverZoomLink');
                hoverZoom.displayPicFromElement(link);
            }
        });
    }
});
