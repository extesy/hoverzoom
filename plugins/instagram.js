var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Instagram',
    prepareImgLinks:function (callback) {
        $('body').on('mouseenter', 'a[href*="?taken-by"]', function () {
            var link = $(this), img = link.find('img');
            link.data().hoverZoomSrc = [img.attr('src')];
            link.addClass('hoverZoomLink');
            hoverZoom.displayPicFromElement(link);
        });
    }
});
