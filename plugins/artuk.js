var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Art UK',
    prepareImgLinks:function (callback) {
        var res = [];
        $('div.credit').each(function () {
            $(this).css("pointer-events", "none");
        });
        $('body').on('mouseenter', 'img[src*="static.artuk.org"]', function() {
            var img = $(this);
            var url = img.attr('src').replace(/w\d+(h\d+)?/, 'w800h800');
            img.data().hoverZoomSrc = [url];
            img.addClass('hoverZoomLink');
            hoverZoom.displayPicFromElement(img);
        });
        callback($(res));
    }
});