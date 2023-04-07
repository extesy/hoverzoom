var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'picsart',
    version: '1.0',
    prepareImgLinks: function(callback) {
        var pluginName = this.name;

        // sample:   https://cdn140.picsart.com/14c67092-9a27-4f33-a7b3-29b829a2e1f2/387854732027201.jpg?to=fixed&type=webp&r=10&q=70
        // image id: 387854732027201
        $('img[src*="picsart.com"]:not(.hoverZoomMouseover), [style*="picsart.com"]:not(.hoverZoomMouseover)').addClass('hoverZoomMouseover').one('mouseover', function() {
            var src = this.src;
            if (src == undefined) {
                // extract url from style
                let backgroundImage = this.style.backgroundImage;
                if (backgroundImage.indexOf("url") == -1) return;
                const reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
                backgroundImage = backgroundImage.replace(reUrl, '$1');
                // remove leading & trailing quotes
                src = backgroundImage.replace(/^['"]/, "").replace(/['"]+$/, "");
            }
            const link = $(this);

            const re = /\/(\d+)\./;   // image id (e.g. 387854732027201)
            const m = src.match(re);
            if (m == undefined) return;
            const imageId = m[1];

            // API call to get details such as resources used during image creation
            chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:'https://picsart.com/api/i/image?imageId=' + imageId,
                                        headers:[{"header":"Content-Type","value":"application/json"}]},
                                        function (response) {
                                            if (response == null) return;
                                            try {
                                                const j = JSON.parse(response);
                                                const values = hoverZoom.getKeysInJsonObject(j, 'result', false);
                                                var gallery = values.map(v => [v.value]);
                                                link.data().hoverZoomGallerySrc = gallery;
                                                // add fullsize img at 1st position in gallery
                                                const fullsizeUrl = src.replace(/\?.*/, '');
                                                gallery.unshift([fullsizeUrl]);
                                                callback(link, pluginName);
                                                hoverZoom.displayPicFromElement(link);
                                            } catch {}
                                        });
        });

    }
});
