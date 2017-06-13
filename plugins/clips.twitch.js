var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'clips.twitch.tv',
    prepareImgLinks:function (callback) {
        if (!options.zoomVideos) return;
        $('a[href*="clips.twitch.tv/"]').one('mouseenter', function() {
            hoverZoom.prepareFromDocument($(this), this.href, function (doc) {
                let meta = doc.querySelector('meta[property="og:image"][content]');
                return meta ? meta.content.replace('-social-preview.jpg', '.mp4') : false;
            });
        });
    }
});
