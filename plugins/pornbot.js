var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'pornbot.net',
    prepareImgLinks:function (callback) {
        $('a[href*="pornbot.net/"]').one('mouseenter', function() {
            var link = $(this),
                pbId = this.href.replace(/.*pornbot.net\/(\w+).*/, '$1');
            $.get('https://pornbot.net/ajax/info.php?v=' + pbId, function (data) {
                if (data) {
                    link.data().hoverZoomSrc = [options.zoomVideos ? data.mp4Url : data.poster]
                    link.addClass('hoverZoomLink');
                    hoverZoom.displayPicFromElement(link);
                }            
            });
        });
    }
});
