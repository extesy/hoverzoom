var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'LinkedIn',
    version:'0.2',
    prepareImgLinks:function (callback) {
        $('body').on('mouseenter', 'div.avatar, div.ivm-view-attr__img--centered', function () {
            var img = $(this);
            img.data().hoverZoomSrc = [img.css('background-image').slice(4, -1).replace(/"/g, "")];
            img.addClass('hoverZoomLink');
            hoverZoom.displayPicFromElement(img);
        });
    }
});
