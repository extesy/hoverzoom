var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'GoogleSheets',
    version:'0.1',
    prepareImgLinks: function (callback) {
        var res = [];

        $('a[href]').one('mouseover', function() {
            let link = $(this);
            link.data().hoverZoomSrc = [this.href];
            callback(link, this.name);
            hoverZoom.displayPicFromElement(link);
        });
    }
});
