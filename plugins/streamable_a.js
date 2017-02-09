var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'Streamable',
    prepareImgLinks: function (callback) {
        if (!options.zoomVideos) return;
        $('a[href*="//streamable.com/"]').one('mouseenter', function () {
            hoverZoom.prepareFromDocument($(this), this.href, function(doc) {
                return doc.querySelector('source').getAttribute('src');
            });
        });
    }
});
