var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'podcasts_apple',
    version: '1.0',
    prepareImgLinks: function(callback) {
        var name = this.name;

        $('button[id*="audio-controls-playback"]').on('mouseover', function() {
            const link = $(this);
            let data = link.data();

            if (data.hoverZoomMouseOver) return;
            data.hoverZoomMouseOver = true;

            if ($('audio')[0] == undefined) return;
            const url = $('audio')[0].src;

            data.hoverZoomSrc = [url];
            callback(link, name);

            // Podcast is played iff the cursor is still over the player
            if (link.data().hoverZoomMouseOver)
                hoverZoom.displayPicFromElement(link, true);

        }).on('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

    }
});
