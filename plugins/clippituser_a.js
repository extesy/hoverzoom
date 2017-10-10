var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'clippituser.tv',
    prepareImgLinks: function () {
        if (!options.zoomVideos) return;
        $('a[href*="//clippituser.tv/"], a[href*="//www.clippituser.tv/"]').one('mouseenter', function () {
            hoverZoom.prepareFromDocument($(this), this.href, function(doc) {
                // The document might have a video, but might also just have a loading
                // container with data attributes referencing the video source
                var video = doc.querySelector('video');
                if (video) {
                    return video.getAttribute('src');
                }

                var player = doc.getElementById('jwplayer-container');
                if (player) {
                    return player.getAttribute('data-hd-file') || player.getAttribute('data-sd-file');
                }
            });
        });
    }
});
