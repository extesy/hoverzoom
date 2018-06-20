var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'clips.twitch.tv',
    prepareImgLinks:function (callback) {
        $('a[href*="clips.twitch.tv/"]').one('mouseenter', function() {
            if(!options.zoomVideos) return;
            var link = $(this),
                slug = this.href.replace(/.*clips.twitch.tv\/(\w+).*/, '$1');
            $.get('https://clips.twitch.tv/api/v2/clips/' + slug + '/status', function (data) {
                if (data && data.quality_options) {
                    link.data().hoverZoomSrc = [data.quality_options[0].source]
                    link.addClass('hoverZoomLink');
                    hoverZoom.displayPicFromElement(link);
                }            
            });
        });
    }
});
