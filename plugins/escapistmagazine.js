var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'escapistmagazine',
    prepareImgLinks: function(callback) {
        var res = [];
        $('a[href*="gallery"] img').each(function() {
            var img = $(this),
                link = img.parents('a:eq(0)'), 
                src = img.attr('src');
            var regExp = /\/(\d+)\.jpg/;
            var matches = regExp.exec(src);
            src = src.replace(matches[0], "/" + (parseInt(matches[1]) - 1) + ".jpg");
            
            link.data('hoverZoomSrc', [src]); 
            res.push(link);
        });
        callback($(res));
    }
});
