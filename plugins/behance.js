var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'behance.net',
    version:'1.1',
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

        // videos
        // sample url: https://www.behance.net/videos/b23f1aaf-b5cb-4104-b91e-4f4523010fd5/Let-s-make-webcomics?tracking_source=to_replay&from_row=Illustration
        // =>     mp4: https://livestream-videos-prod.s3-us-west-2.amazonaws.com/master-stream-b23f1aaf-b5cb-4104-b91e-4f4523010fd5.mp4
        $('a[href*="/videos/"]:not(.hoverZoomMouseover)').filter(function() { return (/to_replay/.test($(this).prop('href'))) }).addClass('hoverZoomMouseover').one('mouseover', function() {
            var link = $(this);
            const re = /\/videos\/(.*?-.*?-.*?-.*?-.*?)\//;   // extract video id (e.g. b23f1aaf-b5cb-4104-b91e-4f4523010fd5)
            var m = this.href.match(re);
            if (m == undefined) return;
            let videoId = m[1];
            var videoUrl = 'https://livestream-videos-prod.s3-us-west-2.amazonaws.com/master-stream-' + videoId + '.mp4';
            link.data().hoverZoomSrc = [videoUrl];
            callback(link, name);
            hoverZoom.displayPicFromElement(link);
        });

        callback($(res), this.name);
    }
});