var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'bnf',
    version: '1.0',
    prepareImgLinks: function(callback) {
        var res = [];

        // sample:   http://visualiseur.bnf.fr/ConsulterElementNum?O=IFN-52500250&E=JPEG&Deb=128&Fin=128&Param=A
        // fullsize: http://visualiseur.bnf.fr/ConsulterElementNum?O=IFN-52500250&E=JPEG&Deb=128&Fin=128&Param=F
        hoverZoom.urlReplace(res,
            'img[src*="&Param="]',
            /&Param=./,
            '&Param=F'
        );

        // sample:   https://gallica.bnf.fr/ark:/12148/btv1b10085371b/f4.thumbnail
        // fullsize: https://gallica.bnf.fr/ark:/12148/btv1b10085371b/f4.highres
        $('img[src*="/ark:/"], a[href*="/ark:/"], [style*=url]').each(function() {

            let data = $(this).data();
            if (data.hoverZoomGallerySrc) return;

            // extract src from an image, a background-image or a link
            let src = '';
            if (this.href != undefined) {
                src = this.href;
            } else if (this.src != undefined) {
                src = this.src;
            } else {
                let backgroundImage = this.style.backgroundImage;
                reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
                backgroundImage = backgroundImage.replace(reUrl, '$1');
                src = backgroundImage.replace(/^['"]/,"").replace(/['"]+$/,""); // remove leading & trailing quotes
            }

            const reRootSrc = /.*\.bnf\.fr\/ark\:\/\d+\/[0-9a-z]{1,}/;
            let m = src.match(reRootSrc);
            if (m == undefined) return;
            let rootSrc = m[0];

            let indexSrc = 0;
            const reIndexSrc = /.*\.bnf\.fr\/ark\:\/\d+\/[0-9a-z]{1,}\/f(\d+)/;
            m = src.match(reIndexSrc);
            if (m) indexSrc = parseInt(m[1]) - 1;

            // ultra-high resolution is obtained by setting width to arbitrary value
            // sample:          https://gallica.bnf.fr/ark:/12148/bpt6k1027952q/f1.highres
            // width = 3000 px: https://gallica.bnf.fr/iiif/ark:/12148/bpt6k1027952q/f1/full/3000,/0/native.jpg
            // to activate ultra-high resolution set ultraRes to "true"
            const ultraRes = false;
            const ultraWidth = 3000;
            data.hoverZoomSrc = [];
            data.hoverZoomGallerySrc = [];

            // build a gallery with 1000 items
            for (var k = 1; k < 1000; k++) {
                var url = (ultraRes ? rootSrc.replace('/ark:/', '/iiif/ark:/') + '/f' + k + '/full/' + ultraWidth + ',/0/native.jpg' : rootSrc + '/f' + k + '.highres');
                data.hoverZoomGallerySrc.push([url]);
            }
            // set gallery index (0-based), since img displayed might not be the first img of gallery
            data.hoverZoomGalleryIndex = indexSrc;

            // since gallery size is unknown: load error => end of gallery reached
            data.abortOnFirstError = true;

            //$(this).addClass('hoverZoomLinkFromPlugIn');
            //res.push(this);
            res.push($(this));
        });

        callback($(res), this.name);
    }
});