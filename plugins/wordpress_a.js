var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Wordpress',
    version:'2.5',
    favicon:'worldpress.svg',
    prepareImgLinks:function (callback) {

        var res = [];

        // sample: https://globalvoices.org/wp-content/uploads/2018/11/Migrants_in_Hungary_2015_Aug_018-800x450-400x300.jpg
        //      -> https://globalvoices.org/wp-content/uploads/2018/11/Migrants_in_Hungary_2015_Aug_018.jpg
        // sample: https://www.ece.fr/ecole-ingenieur/wp-content/uploads/2013/08/prepa-integree-ecole-ingenieur-454x240-c-default.jpg
        //      -> https://www.ece.fr/ecole-ingenieur/wp-content/uploads/2013/08/prepa-integree-ecole-ingenieur.jpg
        // sample: https://blind.com/wp-content/uploads/2016/09/motion_animation2-640x0-cropped.jpg
        //      -> https://blind.com/wp-content/uploads/2016/09/motion_animation2.jpg
        // sample: https://www.pariszigzag.fr/wp-content/uploads/2023/05/hotel-de-matignon-@Benoit-Granier-Matignon-e1684853353287.jpeg
        //      -> https://www.pariszigzag.fr/wp-content/uploads/2023/05/hotel-de-matignon-@Benoit-Granier-Matignon.jpeg
        const re = /-\d+x\d+/ig;
        const re2 = /-e[0-9]{13}/;
        const re3 = /-(cropped|c-default|scaled)/;

        $('img[src*="wp-content/"]').each(function () {
            const src = this.src;
            const fullsizeUrl = src.replace(re, '').replace(re2, '').replace(re3, '');
            if (fullsizeUrl !== src) {
                var link = $(this);
                link.data().hoverZoomSrc = [fullsizeUrl, fullsizeUrl.replace(/jpg$/, 'jpeg')];
                res.push(link);
            }
        });

        // background images
        $('[style]').each(function() {
            // extract url from style
            // e.g: style="background-image: url(https://globalvoices.org/wp-content/uploads/2019/01/20160507_KAR5877-400x300.jpg)"
            var backgroundImage = this.style.backgroundImage;
            if (backgroundImage && backgroundImage.indexOf('/wp-content/') != -1) {
                const reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
                backgroundImage = backgroundImage.replace(reUrl, '$1');
                // remove leading & trailing quotes
                var backgroundImageUrl = backgroundImage.replace(/^['"]/,"").replace(/['"]+$/,"");
                const fullsizeUrl = backgroundImageUrl.replace(re, '').replace(re2, '').replace(re3, '');
                if (fullsizeUrl !== backgroundImageUrl) {
                    var link = $(this);
                    link.data().hoverZoomSrc = [fullsizeUrl, fullsizeUrl.replace(/jpg$/, 'jpeg')];
                    res.push(link);
                }
            }
        });

        callback($(res), this.name);
    }
});
