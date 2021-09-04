var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'themoviedb',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample:   https://www.themoviedb.org/t/p/w276_and_h350_face/q0QXFRg5bSnaLjbvhamfclt0eId.jpg
        // original: https://www.themoviedb.org/t/p/original/q0QXFRg5bSnaLjbvhamfclt0eId.jpg
        hoverZoom.urlReplace(res,
            'img[src]',
            /\/p\/.*\//,
            '/p/original/'
        );

        if (res.length) {
            callback($(res), this.name);
        }
    }
});
