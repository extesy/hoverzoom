var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Wordpress',
    version:'2.3',
    prepareImgLinks:function (callback) {
        var res = [];

        $('img[src*="wp-content"]').each(function () {
            let img = $(this),
                // a global search is needed
                // ex:"https://globalvoices.org/wp-content/uploads/2018/11/Migrants_in_Hungary_2015_Aug_018-800x450-400x300.jpg"
                // or: https://www.ece.fr/ecole-ingenieur/wp-content/uploads/2013/08/prepa-integree-ecole-ingenieur-454x240-c-default.jpg
                re = /-\d\d+x\d\d+/ig,
                src = this.src;
            if (src.match(re)) {
                src = src.replace('-c-default', '').replace(re, '');
                img.data().hoverZoomSrc = [src, src.replace(/jpg$/, 'jpeg')];
                res.push(img);
            }
        });

        // background images
        $('[style]').each(function() {
            // extract url from style
            // ex: style="background-image: url(https://globalvoices.org/wp-content/uploads/2019/01/20160507_KAR5877-400x300.jpg)"
            let backgroundImage = this.style.backgroundImage;
            if (backgroundImage && backgroundImage.indexOf('wp-content') !== -1) {
                const reUrl = /.*url\s*\(\s*(.*)\s*\).*/i;
                let backgroundImageUrl = backgroundImage.replace(reUrl, '$1');
                // remove leading & trailing quotes
                backgroundImageUrl = backgroundImageUrl.replace(/^['"]/, "").replace(/['"]+$/, "");
                const reThumb = /-\d\d+x\d\d+/ig;
                const fullsizeUrl = backgroundImageUrl.replace('-c-default', '').replace(reThumb, '');
                if (fullsizeUrl !== backgroundImageUrl) {
                    const link = $(this);
                    if (link.data().hoverZoomSrc === undefined) { link.data().hoverZoomSrc = [] }
                    if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) === -1) {
                        link.data().hoverZoomSrc.unshift(fullsizeUrl);
                        res.push(link);
                    }
                }
            }
        });

        callback($(res), this.name);
    }
});
