var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'drupal_a',
    version:'0.3',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample: https://www.britishmuseum.org/sites/default/files/styles/bm_gallery_medium_700h/public/2019-10/coffin-priest-hornedjitef-thebes-mummies-british-museum.jpg?itok=GNzQwwEw
        //      -> https://www.britishmuseum.org/sites/default/files/2019-10/coffin-priest-hornedjitef-thebes-mummies-british-museum.jpg?itok=GNzQwwEw
        // sample: https://images.cnrs.fr/system/files/styles/selection_preview_medium/private/media/images/2023/02/CNRS_20230013_0024_68650.jpg?h=7881f276&itok=LSIypB03
        //      -> https://images.cnrs.fr/system/files/media/images/2023/02/CNRS_20230013_0024_68650.jpg?h=7881f276&itok=LSIypB03
        // sample: https://leseng.rosselcdn.net/sites/default/files/dpistyles_v2/ls_16_9_917w/2023/05/31/node_516510/30171764/public/2023/05/31/000_zq9cf.jpeg?itok=wXUaAz4i1685524735
        //      -> https://leseng.rosselcdn.net/sites/default/files/2023/05/31/000_zq9cf.jpeg?itok=wXUaAz4i1685524735
        // sample: https://archeologie.culture.gouv.fr/sites/archeologie/files/styles/portail_home_focus/public/2021-09/img_2304_0.jpg?h=1017c59c&itok=NRsFLnj1
        //      -> https://archeologie.culture.gouv.fr/sites/archeologie/files/2021-09/img_2304_0.jpg?h=1017c59c&itok=NRsFLnj1
        // sample: https://totalenergies.com/sites/g/files/nytnzq121/files/styles/350x230/public/images/2023-04/TotalEnergies_Seagreen_eolien_en_mer_0.jpg?itok=S7pL9WsE
        //      -> https://totalenergies.com/sites/g/files/nytnzq121/files/images/2023-04/TotalEnergies_Seagreen_eolien_en_mer_0.jpg?itok=S7pL9WsE
        // sample: https://assets.meretmarine.com/s3fs-public/styles/thumbnail_extra_lg/public/images/2024-04/Optimarin_Service_RED_lr-1024x684.jpg?h=199d8c1f&itok=H0ZWMf5_
        //      -> https://assets.meretmarine.com/s3fs-public/images/2024-04/Optimarin_Service_RED_lr-1024x684.jpg?h=199d8c1f&itok=H0ZWMf5_

        const reReplace = '$1/$3';
        const reFind = /(^.*)\/[^\/]{0,}styles[^\/]{0,}\/.*\/(public|private)\/(.*)/;

        function findFullsizeUrl(link, src) {

            let fullsizeUrl = src.replace(reFind, reReplace);
            if (fullsizeUrl == src) return;

            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                link.data().hoverZoomSrc.unshift(fullsizeUrl);
                res.push(link);
            }
        }

        $('img[src*="/public/"], img[src*="/private/"]').each(function() {
            findFullsizeUrl($(this), this.src);
        });

        $('[style*=url]').filter(function() { return /\/(public|private)\//.test(this.style.backgroundImage) }).each(function() {
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
