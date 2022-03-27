var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'viewbug',
    version: '1.0',
    prepareImgLinks: function(callback) {
        var res = [];

        // sample:   https://www.viewbug.com/media/images/contests/contest8467_35x35.jpeg
        // fullsize: https://www.viewbug.com/media/images/contests/contest8467_banner.jpeg
        hoverZoom.urlReplace(res,
            'img[src],div',
            /(contest.*)_(.*)\./,
            '$1_banner.',
            'a'
        );

        // sample:   https://cdnpt01.viewbug.com/media/mediafiles/2019/10/29/86898663_380x380.jpg
        // fullsize: https://cdnpt01.viewbug.com/media/mediafiles/2019/10/29/86898663_large1600.jpg
        hoverZoom.urlReplace(res,
            'img[src],div',
            /_(.*)\./,
            '_large1600.',
            'a'
        );

        callback($(res), this.name);
    }
});
