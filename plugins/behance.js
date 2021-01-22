var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'behance.net',
    version:'1.0',
    prepareImgLinks:function (callback) {

        var res = [];

        // sample:
        // https://mir-s3-cdn-cf.behance.net/projects/max_808/830c19110379207.Y3JvcCwxNjM5LDEyODIsMTI1LDA.jpg -> https://mir-s3-cdn-cf.behance.net/projects/source/830c19110379207.Y3JvcCwxNjM5LDEyODIsMTI1LDA.jpg
        hoverZoom.urlReplace(res,
            'img[src]',
            /\/projects\/.*?\//,
            '/projects/source/'
        );

        // sample:
        // https://mir-s3-cdn-cf.behance.net/project_modules/1400_opt_1/ab6b9d110379207.5feb7a078e087.jpg -> https://mir-s3-cdn-cf.behance.net/project_modules/source/ab6b9d110379207.5feb7a078e087.jpg
        hoverZoom.urlReplace(res,
            'img[src]',
            /\/project_modules\/.*?\//,
            '/project_modules/source/'
        );

        // sample:
        // https://mir-s3-cdn-cf.behance.net/user/50/701400.53b2b0c795321.jpg -> https://mir-s3-cdn-cf.behance.net/user/source/701400.53b2b0c795321.jpg
        hoverZoom.urlReplace(res,
            'img[src]',
            /\/(user|team)\/.*?\//,
            '/$1/source/'
        );

        callback($(res), this.name);
    }
});