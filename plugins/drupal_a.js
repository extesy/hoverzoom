var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'drupal_a',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample: https://www.britishmuseum.org/sites/default/files/styles/bm_gallery_medium_700h/public/2019-10/coffin-priest-hornedjitef-thebes-mummies-british-museum.jpg?itok=GNzQwwEw
        //      -> https://www.britishmuseum.org/sites/default/files/2019-10/coffin-priest-hornedjitef-thebes-mummies-british-museum.jpg?itok=GNzQwwEw
        // sample: https://images.cnrs.fr/system/files/styles/selection_preview_medium/private/media/images/2023/02/CNRS_20230013_0024_68650.jpg?h=7881f276&itok=LSIypB03
        //      -> https://images.cnrs.fr/system/files/media/images/2023/02/CNRS_20230013_0024_68650.jpg?h=7881f276&itok=LSIypB03
        // sample: https://leseng.rosselcdn.net/sites/default/files/dpistyles_v2/ls_16_9_917w/2023/05/31/node_516510/30171764/public/2023/05/31/000_zq9cf.jpeg?itok=wXUaAz4i1685524735
        //      -> https://leseng.rosselcdn.net/sites/default/files/2023/05/31/000_zq9cf.jpeg?itok=wXUaAz4i1685524735

        const rePublic = /(^.*\/sites\/default\/files)\/.*\/public\/(.*)/;
        const rePrivate = /(^.*\/system\/files)\/.*\/private\/(.*)/;
        const reReplace = '$1/$2';

        function findFullsizeUrl(link, src) {
            let fullsizeUrl = src.replace(rePublic, reReplace);
            if (fullsizeUrl == src) {
                fullsizeUrl = src.replace(rePrivate, reReplace);
                if (fullsizeUrl == src) return;
            }

            // decode ASCII characters, for instance: '%2C' -> ','
            // NB: this operation must be try/catched because url might not be well-formed
            try {
                fullsizeUrl = decodeURIComponent(fullsizeUrl);
            } catch {}

            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                link.data().hoverZoomSrc.unshift(fullsizeUrl);
                res.push(link);
            }
        }

        $('img[src*="/sites/default/files/"], img[src*="/system/files/"]').each(function() {
            findFullsizeUrl($(this), this.src);
        });

        $('[style*=url]').filter(function() { return this.style.backgroundImage.indexOf('/sites/default/files/') == -1 && this.style.backgroundImage.indexOf('/system/files/') == -1 ? false : true }).each(function() {
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
