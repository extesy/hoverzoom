var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'allegro',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample:   https://a.allegroimg.com/s400/11049a/8b38bd754b988b3a915534aabd7d/Sram-Apex-4x10s-klamkomanetki-szosa-komplet
        // original: https://a.allegroimg.com/original/11049a/8b38bd754b988b3a915534aabd7d/Sram-Apex-4x10s-klamkomanetki-szosa-komplet
        hoverZoom.urlReplace(res,
            'img[src],[style*="url"]',
            /\/s\d+.*?\//,
            '/original/'
        );

        if (res.length) {
            callback($(res), this.name);
        }
    }
});
