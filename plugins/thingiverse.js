var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'thingiverse.com',
    version:'1.0',
    prepareImgLinks:function (callback) {
        $('a > img[src*="card_preview"]').one('mouseover', function() {
            var link = $(this).parent();
            var href = link.attr('href');
            var thingId = href.substring(href.lastIndexOf(':') + 1);
            $.ajax('https://api.thingiverse.com/things/' + thingId + '/images', {headers: {'Authorization': 'Bearer 56edfc79ecf25922b98202dd79a291aa'}}).done(function (images) {
                var urls = [];
                for (var i = 0; i < images.length; i++) {
                    var sizes = images[i].sizes;
                    var url = [];
                    for (var j = 0; j < sizes.length; j++) {
                        if (sizes[j].size === 'large')
                            url.splice(0, 0, sizes[j].url);
                    }
                    if (url.length > 0) {
                        urls.push(url);
                    }
                }
                hoverZoom.prepareLink(link, urls);
            });
        });
    }
});
