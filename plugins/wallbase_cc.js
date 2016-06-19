var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Wallbase.cc',
    prepareImgLinks:function (callback) {
        $('a[href*="/wallpaper/"] > img').filter(function() {
            return this.parentNode.href.match(/wallpaper\/\d+$/);
        }).one('mousemove', function() {
            hoverZoom.prepareFromDocument($(this.parentNode), this.parentNode.href, function(doc) {
                var img = doc.querySelector('img.wall');
                if (img) {
                    return img.src;
                } else {
                    return false;
                }
            });
        });
    }
});
