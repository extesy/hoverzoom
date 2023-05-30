var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Wordpress',
    version:'2.4',
    prepareImgLinks:function (callback) {
        var res = [];

        $('img[src*="wp-content"]').each(function () {
            let img = $(this),
                // sample: https://globalvoices.org/wp-content/uploads/2018/11/Migrants_in_Hungary_2015_Aug_018-800x450-400x300.jpg
                //      -> https://globalvoices.org/wp-content/uploads/2018/11/Migrants_in_Hungary_2015_Aug_018.jpg
                // sample: https://www.ece.fr/ecole-ingenieur/wp-content/uploads/2013/08/prepa-integree-ecole-ingenieur-454x240-c-default.jpg
                //      -> https://www.ece.fr/ecole-ingenieur/wp-content/uploads/2013/08/prepa-integree-ecole-ingenieur.jpg
                // sample: https://blind.com/wp-content/uploads/2016/09/motion_animation2-640x0-cropped.jpg
                //      -> https://blind.com/wp-content/uploads/2016/09/motion_animation2.jpg
                //re = /-\d\d+x\d\d+/ig,
                re = /-\d+x\d+/ig,
                src = this.src;
            if (src.match(re)) {
                src = src.replace('-cropped', '').replace('-c-default', '').replace(re, '');
                img.data().hoverZoomSrc = [src, src.replace(/jpg$/, 'jpeg')];
                res.push(img);
            }
        });

        // background images
        $('[style]').each(function() {
            // extract url from style
            // e.g: style="background-image: url(https://globalvoices.org/wp-content/uploads/2019/01/20160507_KAR5877-400x300.jpg)"
            let backgroundImage = this.style.backgroundImage;
            if (backgroundImage && backgroundImage.indexOf('wp-content') !== -1) {
                const reUrl = /.*url\s*\(\s*(.*)\s*\).*/i;
                let backgroundImageUrl = backgroundImage.replace(reUrl, '$1');
                // remove leading & trailing quotes
                backgroundImageUrl = backgroundImageUrl.replace(/^['"]/, "").replace(/['"]+$/, "");
                //const reThumb = /-\d\d+x\d\d+/ig;
                const reThumb = /-\d+x\d+/ig;
                const fullsizeUrl = backgroundImageUrl.replace('-cropped', '').replace('-c-default', '').replace(reThumb, '');
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
