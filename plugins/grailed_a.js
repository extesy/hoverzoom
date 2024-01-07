var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'grailed_a',
    version:'1.1',
    prepareImgLinks:function (callback) {

        var res = [];

        // sample: https://process.fs.grailed.com/AJdAgnqCST4iPtnUxiGtTz/auto_image/cache=expiry:max/rotate=deg:exif/output=quality:50/resize=height:144,width:144/no_metadata/compress/J5CWHqMySP2KJddQJPak
        //      -> https://process.fs.grailed.com/AJdAgnqCST4iPtnUxiGtTz/J5CWHqMySP2KJddQJPak
        const re = /\/auto_image\/.*\/compress/;

        // sample: https://media-assets.grailed.com/prd/listing/temp/71b58fdae6d04cb2bc5e5af9b7b9595e?w=700&h=700&fit=clip&q=40&auto=format
        //      -> https://media-assets.grailed.com/prd/listing/temp/71b58fdae6d04cb2bc5e5af9b7b9595e
        const re2 = /\?.*/;

        $('img[src*="grailed.com/"]').each(function () {
            const src = this.src;
            const link = $(this);
            const largeUrl = src.replace(re, '').replace(re2, '');
            link.data().hoverZoomSrc = [largeUrl];
            link.addClass('hoverZoomLink');
            res.push(link);
        });

        // background images
        $('[style*="grailed.com/"]').each(function () {
            // extract url from style
            // e.g: style="background-image: url(https://globalvoices.org/wp-content/uploads/2019/01/20160507_KAR5877-400x300.jpg)"
            var backgroundImage = this.style.backgroundImage;
            if (backgroundImage && backgroundImage.indexOf('grailed.com/') != -1) {
                const link = $(this);
                const reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
                backgroundImage = backgroundImage.replace(reUrl, '$1');
                // remove leading & trailing quotes
                var backgroundImageUrl = backgroundImage.replace(/^['"]/,"").replace(/['"]+$/,"");
                const largeUrl = backgroundImageUrl.replace(re, '').replace(re2, '');
                link.data().hoverZoomSrc = [largeUrl];
                link.addClass('hoverZoomLink');
                res.push(link);
            }
        });

        callback($(res), this.name);
    }
});
