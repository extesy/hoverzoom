var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'redgifs.com',
    prepareImgLinks:function (callback) {
        $('a[href^="https://redgifs.com/"]').one('mouseenter', function() {
            var link = $(this),
                gfyId = this.href.replace(/.*redgifs.com\/(..\/)?(watch\/)?(detail\/)?(\w+).*/, '$4');

            $.get('https://api.redgifs.com/v1/gfycats/' + gfyId, function (data) {
                if (data && data.gfyItem) {
                    link.data().hoverZoomSrc = [options.zoomVideos ? data.gfyItem.mp4Url : data.gfyItem.gifUrl]
                    link.addClass('hoverZoomLink');
                    hoverZoom.displayPicFromElement(link);
                }
            });
        });
    }
});
