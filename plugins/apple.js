var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'podcasts_apple',
    version: '1.0',
    prepareImgLinks: function(callback) {
        var name = this.name;

        // This plug-in:
        // - zoom music, apps & books covers
        // - play podcasts 
        // - do NOT play music tracks

        // sample: https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/20/d5/9f/20d59f6d-89e4-61fe-d3d4-e5680cd5f8b3/5099922840455.jpg/48x48bb.webp
        //      -> https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/20/d5/9f/20d59f6d-89e4-61fe-d3d4-e5680cd5f8b3/5099922840455.jpg/9999x0w.png

        $('a[href*="/podcast/"]').on('mouseover', function() {
            const link = $(this);
            let data = link.data();

            if (data.hoverZoomMouseOver) return;
            data.hoverZoomMouseOver = true;

            const source = link.find('source');
            if (source[0] == undefined) return;
            var url = source[0].srcset.split(' ')[0];
            url = url.replace(/(.*)\/.*/, '$1/9999x0w.png');

            data.hoverZoomSrc = [url];
            callback(link, name);

            // Cover is displayed iff the cursor is still over the image
            if (link.data().hoverZoomMouseOver)
                hoverZoom.displayPicFromElement(link, true);

        }).on('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        $('img, div.songs-list-row__song-index, div.artwork-with-badge, div.artwork-with-badge__artwork, div.artwork-wrapper, div.artwork__radiosity, div.ellipse-lockup, div.product-lockup, div.top-search-lockup, div.track-lockup__artwork-wrapper, div.vertical-video, div.we-lockup__overlay, div.we-book-artwork').on('mouseover', function() {
            const link = $(this);
            let data = link.data();

            if (data.hoverZoomMouseOver) return;
            data.hoverZoomMouseOver = true;

            const source = link.find('source')[0] || link.siblings('source')[0];
            if (source == undefined) return;
            var url = source.srcset.replace(',http', ', http').split(' ')[0].replace(/,$/, '');
            url = url.replace(/(.*)\/.*/, '$1/9999x0w.png');

            data.hoverZoomSrc = [url];
            callback(link, name);

            // Cover is displayed iff the cursor is still over the image
            if (link.data().hoverZoomMouseOver)
                hoverZoom.displayPicFromElement(link, true);

        }).on('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // deal with shadowRoot
        $('amp-lcd').on('mouseover', function() {
            if (this.shadowRoot == undefined) return;

            const link = $(this);
            let data = link.data();

            if (data.hoverZoomMouseOver) return;
            data.hoverZoomMouseOver = true;

            const img = $(this.shadowRoot).find('img')[0];
            if (img == undefined) return;
            const src = img.src;
            if (src == undefined) return;
            var url = src.replace(',http', ', http').split(' ')[0].replace(/,$/, '');
            url = url.replace(/(.*)\/.*/, '$1/9999x0w.png');

            data.hoverZoomSrc = [url];
            callback(link, name);

            // Cover is displayed iff the cursor is still over the image
            if (link.data().hoverZoomMouseOver)
                hoverZoom.displayPicFromElement(link, true);

        }).on('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

    }
});
