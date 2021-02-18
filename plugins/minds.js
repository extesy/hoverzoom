var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'minds',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample: https://cdn.minds.com/fs/v1/avatars/569272650258460672/1575305863
        //      -> https://cdn.minds.com/fs/v1/avatars/569272650258460672/large/1575305863
        hoverZoom.urlReplace(res,
            'img[src],div[style]',
            /\/(\d+)\/(\d+)\/?$/,
            '/$1/large/$2'
        );

        // sample: https://cdn.minds.com/icon/458234535142756352/medium/1612563664
        //      -> https://cdn.minds.com/icon/458234535142756352/large/1612563664
        hoverZoom.urlReplace(res,
            'img[src],div[style]',
            /(small|medium)/,
            'large'
        );

        // sample: https://cdn.minds.com/icon/847513062717005839
        //      -> https://cdn.minds.com/icon/847513062717005839/large
        hoverZoom.urlReplace(res,
            'img[src],div[style]',
            /icon\/(\d+)$/,
            'icon/$1/large'
        );

        // sample: https://cdn.minds.com/api/v2/media/proxy?size=800&src=https%3A%2F%2Fi.ytimg.com%2Fvi%2FvGuo2R8nuyU%2Fmaxresdefault.jpg
        //      -> https://i.ytimg.com/vi/vGuo2R8nuyU/maxresdefault.jpg
        hoverZoom.urlReplace(res,
            'img[src],div[style]',
            /^.*src=(.*)/,
            '$1'
        );


        callback($(res), this.name);
    }
});
