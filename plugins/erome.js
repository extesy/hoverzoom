var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'erome',
    version:'0.1',
    prepareImgLinks:function (callback) {

        var pluginName = this.name;
        var res = [];

        // https://www.erome.com/Lubna_Shokoti

        // videos
        // thumbnail: https://s109.erome.com/6627/BCnEjRoZ/thumbs/w0LV8RiO.jpg?v=1764093028
        // video:     https://v109.erome.com/6627/BCnEjRoZ/w0LV8RiO_720p.mp4

        // images
        // thumbnail: https://s82.erome.com/6627/Ufkeoomy/thumbs/jv5FwMVV.jpeg?v=1764093226
        // fullsize:  https://s82.erome.com/6627/Ufkeoomy/jv5FwMVV.jpeg?v=1764093226

        $('a[href*="erome.com"]').one('mouseover', function() {
            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            const href = this.href;

            chrome.runtime.sendMessage({action:'ajaxGet', url:href}, function (response) {

                if (response == null) { return; }

                const parser = new DOMParser();
                const doc = parser.parseFromString(response, "text/html");

                const gallery = [];

                // videos
                $(doc).find('source').each(function() {
                    if (gallery.find(i => i == this.src) == undefined) gallery.push([this.src]);
                });

                // images
                $(doc).find('img.img-front').each(function() {
                    if (gallery.find(i => i == this.dataset.src) == undefined) gallery.push([this.dataset.src]);
                });

                link.data().hoverZoomGallerySrc = gallery;

                res = [link];
                callback($(res), pluginName);
                // Gallery is displayed iff cursor is still over the gallery
                if (link.data().hoverZoomMouseOver)
                    hoverZoom.displayPicFromElement(link);
            });
        }).one('mouseleave', function() {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });


        // avatars
        // thumbnail: https://avatar.erome.com/36x36/2706/oz8Pi1p1.jpeg?t=1752324617
        // fullsize:  https://avatar.erome.com/2706/oz8Pi1p1.jpeg?t=1752324617

        hoverZoom.urlReplace(res,
            'img[src*="avatar"]',
            /\/\d+x\d+\//,
            '/'
        );

        callback($(res), name);
    }
});
