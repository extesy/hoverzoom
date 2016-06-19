var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Wallhaven.cc',
    prepareImgLinks:function (callback) {
        $('a[href*="/wallpaper/"]').filter(function() {
            return this.href.match(/wallpaper\/\d+$/);
        }).each(function(){
            var link= this.href;
            var img = ($(this).find('img').length > 0 ? $(this) : $(this).parent());

            img.one('mousemove', function() {
                hoverZoom.prepareFromDocument($(this), link, function(doc) {
                    var img = doc.getElementById('wallpaper');
                    if (img) {
                        return img.src;
                    } else {
                        return false;
                    }
                });
            });
        })

    }
});
