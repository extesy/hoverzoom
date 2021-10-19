var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'clips.twitch.tv',
    prepareImgLinks:function (callback) {
        $('a[href*="clips.twitch.tv/"]').one('mouseenter', function() {
            if(!options.zoomVideos) return;
            var slug = this.href.replace(/.*clips.twitch.tv\/([\w-]+)/, '$1');
            hoverZoom.prepareFromDocument($(this), 'https://clips.twitch.tv/' + slug, function (doc) {
                var twitterImg = doc.head.querySelector('meta[name="twitter:image"]');
                if (twitterImg) {
                    return twitterImg.content.replace('-social-preview.jpg', '.mp4');
                }
            });
        });
    }
});
