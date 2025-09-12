var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'behance.net',
    version:'1.2',
    favicon:'behance.svg',
    prepareImgLinks:function (callback) {
        const pluginName = this.name;
        const searchRe = /\/(projects|project_modules|user|team)\/.*?\//
        const replaceRe = '/$1/source/'
        const videoRe = /\/videos\/(.*?-.*?-.*?-.*?-.*?)\//
        var res = [];

        $('div.Cover-wrapper-H_F').on('mouseover', function(event) {

            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            const imgs = link.find('img[src]').filter(function() { return (searchRe.test($(this).prop('src'))) });
            if (imgs.length == 1) {

                const img = imgs[0];
                const fullsize = img.src.replace(searchRe, replaceRe);

                link.data().hoverZoomSrc = [fullsize];
                callback(link, pluginName);
                hoverZoom.displayPicFromElement(link);
                return;
            }

            // moodboard
            // find img being hovered
            const moodImgs = link.find('img');
            if (moodImgs.length > 0) {
                let img = undefined;
                let x = event.pageX;
                let y = event.pageY;

                if (x && y) {
                    moodImgs.each(function() {
                        if(x < $(this).offset().left) return true;
                        if(x > $(this).offset().left + $(this).width()) return true;
                        if(y < $(this).offset().top) return true;
                        if(y > $(this).offset().top + $(this).height()) return true;

                        img = $(this);
                        return false;
                    });
                }
                if (img) {
                    let src = undefined;
                    if (img.src) {
                        src = img.src;
                    } else {
                        // image is in a picture element
                        const source = img.siblings('source')[0];
                        if (source.srcset == undefined) return;
                        src = hoverZoom.getBiggestSrcFromSrcset(source.srcset);
                    }

                    const fullsize = src.replace(searchRe, replaceRe);
                    link.data().hoverZoomSrc = [fullsize];
                    callback(link, pluginName);
                    hoverZoom.displayPicFromElement(link);
                    return;
                }
            }

        }).on('mouseleave', function() {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // sample:
        // https://mir-s3-cdn-cf.behance.net/projects/max_808/830c19110379207.Y3JvcCwxNjM5LDEyODIsMTI1LDA.jpg -> https://mir-s3-cdn-cf.behance.net/projects/source/830c19110379207.Y3JvcCwxNjM5LDEyODIsMTI1LDA.jpg
        // sample:
        // https://mir-s3-cdn-cf.behance.net/project_modules/1400_opt_1/ab6b9d110379207.5feb7a078e087.jpg -> https://mir-s3-cdn-cf.behance.net/project_modules/source/ab6b9d110379207.5feb7a078e087.jpg
        // sample:
        // https://mir-s3-cdn-cf.behance.net/user/50/701400.53b2b0c795321.jpg -> https://mir-s3-cdn-cf.behance.net/user/source/701400.53b2b0c795321.jpg
        hoverZoom.urlReplace(res,
            'img[src]',
            searchRe,
            replaceRe
        );

        // sample: https://cdn.cp.adobe.io/content/2/rendition/42c303e0-7a3a-4f55-a7c8-db4a1d289dc7/version/0/format/jpg/dimension/width/size/200 -> https://cdn.cp.adobe.io/content/2/rendition/42c303e0-7a3a-4f55-a7c8-db4a1d289dc7/version/0/format/jpg/dimension/width/size/0
        hoverZoom.urlReplace(res,
            'img[src*="adobe.io"]',
            /\/size\/\d+/,
            '/size/0'
        );

        // videos
        // sample url: https://www.behance.net/videos/b23f1aaf-b5cb-4104-b91e-4f4523010fd5/Let-s-make-webcomics?tracking_source=to_replay&from_row=Illustration
        // =>     mp4: https://livestream-videos-prod.s3-us-west-2.amazonaws.com/master-stream-b23f1aaf-b5cb-4104-b91e-4f4523010fd5.mp4
        $('a[href*="/videos/"]').filter(function() { return (/to_replay/.test($(this).prop('href'))) }).on('mouseover', function() {

            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            // extract video id (e.g. b23f1aaf-b5cb-4104-b91e-4f4523010fd5)
            const m = this.href.match(videoRe);
            if (m == undefined) return;
            const videoId = m[1];
            const videoUrl = `https://livestream-videos-prod.s3-us-west-2.amazonaws.com/master-stream-${videoId}.mp4`;
            link.data().hoverZoomSrc = [videoUrl];
            callback(link, name);
            hoverZoom.displayPicFromElement(link);

        }).on('mouseleave', function() {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // live
        // sample url: https://www.behance.net/videos/8bbe3909-f443-44af-9d99-2b4e038222d9/Creating-Dimensional-Gold-Pearl-Lettering-with-Photoshop-Mixer-Brushes?tracking_source=to_live&from_row=What%27s_New
        // => https://livestream-cdn.adobe.io/api/video/8bbe3909-f443-44af-9d99-2b4e038222d9/embed
        $('a[href*="/videos/"]').filter(function() { return (/to_live/.test($(this).prop('href'))) }).on('mouseover', function() {

            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            // extract video id (e.g. 8bbe3909-f443-44af-9d99-2b4e038222d9)
            const m = this.href.match(videoRe);
            if (m == undefined) return;
            const videoId = m[1];
            const videoUrl = `https://livestream-cdn.adobe.io/api/video/${videoId}/embed`;
            link.data().hoverZoomSrc = [videoUrl];
            callback(link, name);
            hoverZoom.displayPicFromElement(link);

        }).on('mouseleave', function() {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        callback($(res), this.name);
    }
});