var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'nature',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample: https://media.springernature.com/lw685/springer-static/image/art%3A10.1038%2Fs41586-024-07053-4/MediaObjects/41586_2024_7053_Fig1_HTML.png?as=webp
        //      -> https://media.springernature.com/full/springer-static/image/art%3A10.1038%2Fs41586-024-07053-4/MediaObjects/41586_2024_7053_Fig1_HTML.png?as=webp
        // sample: https://images.nature.com/w140h79/magazine-assets/d41586-024-01036-1/d41586-024-01036-1_26947866.jpg
        //      -> https://images.nature.com/original/magazine-assets/d41586-024-01036-1/d41586-024-01036-1_26947866.jpg

        const reFind1 = /\.nature.com\/l?[hw]\d+.*?\//;
        const reReplace1 = '.nature.com/original/';
        const reFind2 = /springernature.com\/l?[hw]\d+.*?\//;
        const reReplace2 = 'springernature.com/full/';

        function findFullsizeUrl(link, src) {
            let fullsizeUrl = src.replace(reFind1, reReplace1).replace(reFind2, reReplace2);
            if (fullsizeUrl == src) return;

            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                link.data().hoverZoomSrc.unshift(fullsizeUrl);
                res.push(link);
            }
        }

        $('img[src]').each(function() {
            findFullsizeUrl($(this), this.src);
        });

        $('[style*=url]').each(function() {
            // extract url from style
            var backgroundImage = this.style.backgroundImage;
            const reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            // remove leading & trailing quotes
            var backgroundImageUrl = backgroundImage.replace(/^['"]/, '').replace(/['"]+$/, '');
            findFullsizeUrl($(this), backgroundImageUrl);
        });

        if (res.length) {
            callback($(res), this.name);
        }
    }
});
