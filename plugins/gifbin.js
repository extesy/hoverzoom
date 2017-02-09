var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'gifbin',
    prepareImgLinks:function (callback) {
        $('a[href*="gifbin.com/"]').one('mouseover', function() {
            hoverZoom.prepareFromDocument($(this), this.href, function(doc) {
                var img = doc.getElementById('gif');
                return img ? img.src : false;
            });
        });
    }
});
