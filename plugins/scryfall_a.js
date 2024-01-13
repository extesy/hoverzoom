var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'scryfall_a',
    version:'1.1',
    prepareImgLinks:function (callback) {

        var res = [];

        // sample: https://cards.scryfall.io/normal/front/3/2/32c0ff83-04a7-4d5a-b901-6b8a698c5a4d.jpg?1674142570
        //      -> https://cards.scryfall.io/large/front/3/2/32c0ff83-04a7-4d5a-b901-6b8a698c5a4d.jpg?1674142570    (good quality)
        //      -> https://cards.scryfall.io/original/front/3/2/32c0ff83-04a7-4d5a-b901-6b8a698c5a4d.jpg?1674142570 (very good quality)
        //      -> https://cards.scryfall.io/png/front/3/2/32c0ff83-04a7-4d5a-b901-6b8a698c5a4d.png?1674142570      (highest quality)
        const re = /scryfall.io\/(.*?)\//;

        $('img[src*="scryfall.io/"]').each(function () {
            const src = this.src;
            const link = $(this);
            const pngUrl = src.replace(re, 'scryfall.io/png/').replace('.jpg', '.png');
            link.data().hoverZoomSrc = [pngUrl];
            const originalUrl = src.replace(re, 'scryfall.io/original/');
            link.data().hoverZoomSrc.push(originalUrl);
            const largeUrl = src.replace(re, 'scryfall.io/large/');
            link.data().hoverZoomSrc.push(largeUrl);
            link.addClass('hoverZoomLink');
            res.push(link);
        });

        // background images
        $('[style*="scryfall.io/"]').each(function () {
            // extract url from style
            // e.g: style="background-image: url(https://globalvoices.org/wp-content/uploads/2019/01/20160507_KAR5877-400x300.jpg)"
            var backgroundImage = this.style.backgroundImage;
            if (backgroundImage && backgroundImage.indexOf('scryfall.io/') != -1) {
                const link = $(this);
                const reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
                backgroundImage = backgroundImage.replace(reUrl, '$1');
                // remove leading & trailing quotes
                var backgroundImageUrl = backgroundImage.replace(/^['"]/,"").replace(/['"]+$/,"");
                const pngUrl = backgroundImageUrl.replace(re, 'scryfall.io/png/').replace('.jpg', '.png');
                link.data().hoverZoomSrc = [pngUrl];
                const originalUrl = backgroundImageUrl.replace(re, 'scryfall.io/original/');
                link.data().hoverZoomSrc.push(originalUrl);
                const largeUrl = backgroundImageUrl.replace(re, 'scryfall.io/large/');
                link.data().hoverZoomSrc.push(largeUrl);
                link.addClass('hoverZoomLink');
                res.push(link);
            }
        });

        callback($(res), this.name);
    }
});
