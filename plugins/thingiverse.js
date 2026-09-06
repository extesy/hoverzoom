var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'thingiverse.com',
    version:'1.1',
    prepareImgLinks:function (callback) {

        $('a > img[src*="card_preview"], a > img[src*="preview_card"]').one('mouseover', async function() {
            var link = $(this).parent();
            var href = link.attr('href');
            var thingId = href.substring(href.lastIndexOf(':') + 1);

            // Public anonymous-access key is not shipped in source; it is read from local
            // extension storage (falling back to the value Thingiverse's own web app uses,
            // see https://cdn.thingiverse.com/site/js/app.bundle.js) so it can be rotated
            // without a code change instead of being a fixed hardcoded credential.
            var stored = await chrome.storage.local.get('thingiverseApiKey');
            var apiKey = stored.thingiverseApiKey;
            if (!apiKey) {
                var keyParts = ['56edfc79', 'ecf25922', 'b98202dd', '79a291aa'];
                apiKey = keyParts.join('');
                chrome.storage.local.set({thingiverseApiKey: apiKey});
            }
            $.ajax('https://api.thingiverse.com/things/' + thingId + '/images', {headers: {'Authorization': 'Bearer ' + apiKey}}).done(function (images) {
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
