var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Wired',
    version:'0.3',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img',
            /-\d+x\d+\./,
            '.'
        );

        hoverZoom.urlReplace(res,
            'img[src*="/thumbs/"]',
            'thumbs/thumbs_',
            ''
        );

        hoverZoom.urlReplace(res,
            'img[src*="_w"]',
            /_wd?\./,
            '_bg.'
        );

        $('img[src]').each(function() {
            const url = this.src;
            try {
                // decode ASCII characters, for instance: '%2C' -> ','
                // NB: this operation must be try/catched because url might not be well-formed
                let fullsizeUrl = decodeURIComponent(url);
                fullsizeUrl = fullsizeUrl.replace(/\/1:1(,.*?)?\//, '/').replace(/\/16:9(,.*?)?\//, '/').replace(/\/[wW]_?\d+(,.*?)?\//, '/').replace(/\/[hH]_?\d+(,.*?)?\//, '/').replace(/\/[qQ]_?\d+(,.*?)?\//, '/').replace(/\/q_auto(,.*?)?\//, '/').replace(/\/c_limit(,.*?)?\//, '/').replace(/\/c_scale(,.*?)?\//, '/').replace(/\/c_fill(,.*?)?\//, '/').replace(/\/f_auto(,.*?)?\//, '/');
                let link = $(this).parents('a');
                if (link.length == 0) link = $(this);
                if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                    link.data().hoverZoomSrc.unshift(fullsizeUrl);
                    res.push(link);
                }
            }
            catch {}
        });

        callback($(res), this.name);
    }
});
