var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'LibraryOfCongress',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src]',
            /-\d+x\d+\./,
            '.'
        );

        // for .TIF files: convert to max size JPG
        // sample: https://memory.loc.gov/diglib/media/loc.natlib.ihas.200033378/0001.tif/221
        //      -> https://memory.loc.gov/diglib/media/loc.natlib.ihas.200033378/0001.tif/10000
        hoverZoom.urlReplace(res,
            'img[src]',
            /\.tif\/\d+/,
            '.tif/10000'
        );

        // raise zoom to %100
        // sample: https://chroniclingamerica.loc.gov/iiif/2/mimtptc_fostoria_ver01%2Fdata%2Fsn83045399%2F00279551783%2F1963020901%2F0431.jp2/pct:14.99,6.49,11.63,15.94/pct:10/0/default.jpg
        //      -> https://chroniclingamerica.loc.gov/iiif/2/mimtptc_fostoria_ver01%2Fdata%2Fsn83045399%2F00279551783%2F1963020901%2F0431.jp2/pct:14.99,6.49,11.63,15.94/pct:100/0/default.jpg
        // note: to remove cropping: https://chroniclingamerica.loc.gov/iiif/2/mimtptc_fostoria_ver01%2Fdata%2Fsn83045399%2F00279551783%2F1963020901%2F0431.jp2/full/pct:100/0/default.jpg
        hoverZoom.urlReplace(res,
            'img[src]',
            /\/pct:\d+\.?\d+\//,
            '/pct:100/'
        );

        // pictures are available in various sizes:
        // samples (asc sizes):
        // https://tile.loc.gov/storage-services/service/pnp/fsa/8a17000/8a17900/8a17904_150px.jpg
        // https://tile.loc.gov/storage-services/service/pnp/fsa/8a17000/8a17900/8a17904t.gif
        // https://tile.loc.gov/storage-services/service/pnp/fsa/8a17000/8a17900/8a17904r.jpg
        // https://tile.loc.gov/storage-services/service/pnp/fsa/8a17000/8a17900/8a17904v.jpg
        // https://tile.loc.gov/storage-services/master/pnp/fsa/8a17000/8a17900/8a17904u.tif
        // https://tile.loc.gov/storage-services/master/pnp/fsa/8a17000/8a17900/8a17904a.tif

        // Chrome does NOT display .TIF files
        //hoverZoom.urlReplace(res,
        //    'img[src]',
        //    /\/service\/(.*)_150px.*/,
        //    '/master/$1u.tif'
        //);

        hoverZoom.urlReplace(res,
            'img[src]',
            ['_150px.jpg', '_60px.jpg', '_75x75px.jpg'],
            ['t.gif', 't.gif', 't.gif']
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            ['_150px.jpg', '_60px.jpg', '_75x75px.jpg'],
            ['r.jpg', 'r.jpg', 'r.jpg']
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            ['_150px.jpg', '_60px.jpg', '_75x75px.jpg'],
            ['v.jpg', 'v.jpg', 'v.jpg']
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            'r.jpg',
            'v.jpg'
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            ['s-th.jpg', 's.jpg', 't.gif'],
            ['.jpg', '.jpg', '.gif']
        );

        // sample: https://tile.loc.gov/storage-services/service/gmd/gmd3m/g3300m/g3300m/gar00003/ara00001.gif
        //      -> https://tile.loc.gov/image-services/iiif/service:gmd:gmd3m:g3300m:g3300m:gar00003:ara00001/full/pct:100/0/default.jpg
        // sample: https://tile.loc.gov/storage-services/service/gmd/gmd3/g3300/g3300/ar008300.gif
        //      -> https://tile.loc.gov/image-services/iiif/service:gmd:gmd3:g3300:g3300:ar008300/full/pct:100/0/default.jpg
        $('img[src]').each(function() {

            var link = $(this);
            var url = link[0].src;

            var m = url.match(/(.*\/storage-services\/)(.*?)(t?\.gif|_150px\.jpg|_60px\.jpg|_75x75px\.jpg).*/);
            if (m == null) return;

            var fullsizeUrl = m[1].replace('storage-services', 'image-services') + 'iiif/' + m[2].replace(/\//g, ':') + '/full/pct:100/0/default.jpg';

            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                link.data().hoverZoomSrc.unshift(fullsizeUrl);
            }

            res.push(link);
        });

        callback($(res), this.name);
    }
});
