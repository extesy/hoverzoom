var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'pexels.com',
    version:'0.2',
    favicon:'pexels.png',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src*="pexels.com"]',
            [/(jpe?g)\?.*/, /-small(\.jpe?g)/, /-medium(\.jpe?g)/],
            ['$1', '$1', '$1']
        );

        // videos
        // sample: https://videos.pexels.com/video-files/856486/856486-sd_640_360_30fps.mp4
        //      -> https://videos.pexels.com/video-files/856486/856486-hd_1920_1080_30fps.mp4

        $('a video').on('mouseover', function() {

            const link = $(this).parents('a');
            let data = link.data();

            if (data.hoverZoomMouseOver) return;
            data.hoverZoomMouseOver = true;

            // remove default video
            $(this).data().hoverZoomSrc = [];

            const videoUrl = this.src;
            const videoHdUrl = videoUrl.replace(/-sd_\d+_\d+_/, '-hd_1920_1080_');
            const videoUhdUrl = videoUrl.replace(/-sd_\d+_\d+_/, '-uhd_3840_2160_');

            data.hoverZoomSrc = [videoUhdUrl, videoHdUrl, videoUrl];
            callback(link, this.name);

            // Image or video is displayed iff the cursor is still over the link
            if (data.hoverZoomMouseOver)
                hoverZoom.displayPicFromElement(link, true);

        }).on('mouseleave', function () {
            const link = $(this).parents('a');
            link.data().hoverZoomMouseOver = false;
        });

        callback($(res), this.name);
    }
});