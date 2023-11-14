var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'prestashop_a',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        const reMatch = /\/(\d+)-(cart|category|home|large|medium|small|thickbox)_default\//
        const reReplace = '/$1/'

        // images
        // samples from: https://exploreparis.com/fr/22-toutes-les-visites
        //    thumbnail: https://exploreparis.com/13762-home_default/richelieu-berceau-historique-de-la-bnf.jpg
        //     fullsize: https://exploreparis.com/13762/richelieu-berceau-historique-de-la-bnf.jpg
        hoverZoom.urlReplace(res,
            'img[src]',
            reMatch,
            reReplace
        );

        // background images
        $('[style*=url]').each(function() {
            let link = $(this);
            // extract url from style
            let backgroundImage = this.style.backgroundImage;
            const reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            // remove leading & trailing quotes
            const src = backgroundImage.replace(/^['"]/, "").replace(/['"]+$/, "");
            const fullsize = src.replace(reMatch, reReplace);
            if (fullsize != src) {
                link.data().hoverZoomSrc = [fullsize];
                res.push(link);
            }
        });

        callback($(res), this.name);
    }
});