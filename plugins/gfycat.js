var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'gfycat.com',
    prepareImgLinks:function (callback) {
        $('a[href*="gfycat.com/"]').one('mouseenter', function() {
            var link = $(this),
                gfyId = this.href.replace(/.*gfycat.com\/(gifs\/)?(detail\/)?(\w+).*/, '$3');
            $.get('https://gfycat.com/cajax/get/' + gfyId, function (data) {
                if (data && data.gfyItem) {
                    link.data().hoverZoomSrc = [options.zoomVideos ? data.gfyItem.webmUrl : data.gfyItem.gifUrl]
                    link.addClass('hoverZoomLink');
                    hoverZoom.displayPicFromElement(link);
                }            
            });
        });
    }
});
