var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'tcgplayer_a',
    version:'1.0',
    prepareImgLinks:function (callback) {

        var res = [];

        // sample: https://product-images.tcgplayer.com/fit-in/200x279/177194.jpg
        //      -> https://product-images.tcgplayer.com/fit-in/1311x1311/filters:quality(100)/177194.jpg
        const re = /tcgplayer\.com\/fit-in\/(\d+x\d+)\/((filters.*?\/){0,1})/;
        const repl = 'tcgplayer.com/fit-in/1311x1311/filters:quality(100)/';

        // sample: https://tcgplayer-cdn.tcgplayer.com/product/504497_200w.jpg
        //      -> https://product-images.tcgplayer.com/fit-in/1311x1311/filters:quality(100)/504497.jpg
        const re2 = /tcgplayer-cdn\.tcgplayer\.com\/product\/(\d+).*/;
        const repl2 = 'product-images.tcgplayer.com/fit-in/1311x1311/filters:quality(100)/$1.jpg';

        $('img[src*="tcgplayer.com/fit-in/"], img[src*="tcgplayer-cdn.tcgplayer.com/product/"]').each(function () {
            const src = this.src;
            const link = $(this);
            const largeUrl = src.replace(re, repl).replace(re2, repl2);
            link.data().hoverZoomSrc = [largeUrl];
            link.addClass('hoverZoomLink');
            res.push(link);
        });

        // background images
        $('[style]').each(function () {
            // extract url from style
            // e.g: style="background-image: url(https://globalvoices.org/wp-content/uploads/2019/01/20160507_KAR5877-400x300.jpg)"
            var backgroundImage = this.style.backgroundImage;
            if (backgroundImage && (backgroundImage.indexOf('tcgplayer.com/fit-in/') != -1 || backgroundImage.indexOf('tcgplayer-cdn.tcgplayer.com/product/') != -1)) {
                const link = $(this);
                const reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
                backgroundImage = backgroundImage.replace(reUrl, '$1');
                // remove leading & trailing quotes
                var backgroundImageUrl = backgroundImage.replace(/^['"]/,"").replace(/['"]+$/,"");
                const largeUrl = backgroundImageUrl.replace(re, repl).replace(re2, repl2);
                link.data().hoverZoomSrc = [largeUrl];
                link.addClass('hoverZoomLink');
                res.push(link);
            }
        });

        callback($(res), this.name);
    }
});
