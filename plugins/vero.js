var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'vero',
    version:'1.0',
    prepareImgLinks:function (callback) {
        var name = this.name;
        var res = [];

        // image
        // sample: https://d1dpu3msttfsqg.cloudfront.net/c66e6eb0-2522-11e5-916b-693194eb50e3/826ddd26-2608-4422-9d78-f1750a907a7b_246x246.jpg
        //      -> https://d1dpu3msttfsqg.cloudfront.net/c66e6eb0-2522-11e5-916b-693194eb50e3/826ddd26-2608-4422-9d78-f1750a907a7b
        const re = /(.*)_.*/;

        $('img[src*="cloudfront.net/"]').filter(function() { return (! /(\/p0|\/v0)/.test($(this).prop('src'))) }).each(function () {
            const src = this.src;
            const link = $(this);
            const fullsize = src.replace(re, '$1');
            link.data().hoverZoomSrc = [fullsize];
            link.addClass('hoverZoomLink');
            res.push(link);
        });

        // background images
        $('[style]').filter(function() { return $(this).parent('a').find('video, .video').length == 0 } ).each(function () {
            // extract url from style
            // e.g: style="background-image: url(https://globalvoices.org/wp-content/uploads/2019/01/20160507_KAR5877-400x300.jpg)"
            var backgroundImage = this.style.backgroundImage;
            if (/(\/p0|\/v0)/.test(backgroundImage)) return;
            if (backgroundImage && backgroundImage.indexOf('cloudfront.net/') != -1) {
                const link = $(this);
                const reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
                backgroundImage = backgroundImage.replace(reUrl, '$1');
                // remove leading & trailing quotes
                var backgroundImageUrl = backgroundImage.replace(/^['"]/, '').replace(/['"]+$/, '');
                const fullsize = backgroundImageUrl.replace(re, '$1');
                link.data().hoverZoomSrc = [fullsize];
                link.addClass('hoverZoomLink');
                res.push(link);
            }
        });

        // video
        // sample: https://d2hzlifut58gpa.cloudfront.net/c66e6eb0-2522-11e5-916b-693194eb50e3/ba49a84a-c4fe-47d4-89aa-acaf72a21e9c/p0
        //      -> https://d2hzlifut58gpa.cloudfront.net/c66e6eb0-2522-11e5-916b-693194eb50e3/ba49a84a-c4fe-47d4-89aa-acaf72a21e9c/v0
        // sample: https://d2hzlifut58gpa.cloudfront.net/f5483cd0-4cc1-11e6-8070-93336da0718c/bc06b814-4bb6-431b-9d01-434179603386/p0
        //      -> https://d2hzlifut58gpa.cloudfront.net/f5483cd0-4cc1-11e6-8070-93336da0718c/bc06b814-4bb6-431b-9d01-434179603386/p0.mp4
        $('a video source[src*="/p0"]').each(function() {
            var link = $(this).parents('a');
            const videoUrlMP4 = this.src.replace('/p0', '/p0.mp4');
            const videoUrlV0 = this.src.replace('/p0', '/v0.video');
            link.data().hoverZoomSrc = [];
            link.data().hoverZoomSrc.push(videoUrlMP4);
            link.data().hoverZoomSrc.push(videoUrlV0);
            link.addClass('hoverZoomLink');
            res.push(link);
        });

        callback($(res), name);
    }
});
