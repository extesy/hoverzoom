var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Le bon coin',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src*="thumbs"], span.thumbs',
            'thumbs',
            'images'
        );

        //sample url : https://img3.leboncoin.fr/ad-thumb/cc15170487f75709b751a61ee8b52b4ebed2a062.jpg
        //          -> https://img3.leboncoin.fr/ad-large/cc15170487f75709b751a61ee8b52b4ebed2a062.jpg
        hoverZoom.urlReplace(res,
            'img[src]',
            /\/ad-.*?\//,
            '/ad-large/'
        );

        callback($(res));
    }
});
