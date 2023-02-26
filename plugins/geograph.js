var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'geograph',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src], [style*="url"]',
            [/_\d+x\d+/, /_\d+XX\d+/],
            ['', '']
        );

        hoverZoom.urlReplace(res,
            'img[src], [style*="url"]',
            [/_\d+x\d+/, /_\d+XX\d+/],
            ['_1024x1024', '_1024x1024']
        );

        // sample:   https://s0.geograph.org.uk/geophotos/02/50/43/2504372_3398f781_120x120.jpg
        // fullsize: https://s0.geograph.org.uk/geophotos/02/50/43/2504372_3398f781_original.jpg (NSFW !)
        hoverZoom.urlReplace(res,
            'img[src], [style*="url"]',
            [/_\d+x\d+/, /_\d+XX\d+/],
            ['_original', '_original']
        );

        $('[href*="/photo/"], [href*="/gridref/"]').one('mouseenter', function() {
            if ($(this).find('img').length) return;
            var link = $(this);
            // clean previous result
            link.data().hoverZoomSrc = [];
            link.data().hoverZoomGallerySrc = [];
            link.data().hoverZoomGalleryCaption = [];
            hoverZoom.prepareFromDocument($(this), this.href, function(doc, callback) {
                console.log(link);
                let imgs = doc.querySelectorAll('img[src*="photos/"]');
                if (imgs) {
                    var gallery = [];
                    $(imgs).each(function() {
                        console.log(this.src);
                        gallery.push([this.src.replace(/_\d+x\d+/, '').replace(/_\d+XX\d+/, '')]);
                        link.data().hoverZoomGalleryCaption.push([this.alt]);
                    });
                    callback(gallery);
                    hoverZoom.displayPicFromElement(link);
                }
            }, true); // get source async
        });

        callback($(res), this.name);
    }
});
