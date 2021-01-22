var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'wykop.pl',
    version: '0.2',
    prepareImgLinks(callback) {
        const res = [];

        $('div.media-content.video').each((i, item) => {
            const a = $('a.ajax', item)[0];
            const img = $('img.block.lazy', a)[0];
            const data = $(img).data();

            const url = a.href.match(/https?:\/\/(?:giant\.)?gfycat\.com\/([^.]+)(?:.+)?/);
            if (url !== null) {
                data.hoverZoomSrc = ['mp4', 'webm'].map(ext => `https://giant.gfycat.com/${url[1]}.${ext}`);
            }

            res.push($(img));
        });

        hoverZoom.urlReplace(res,
            'img[src]',
            /,.*\./,
            '.'
        );

        if (res.length > 0) {
            callback($(res));
        }
    },
});
