var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'uinotes',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        //   page: https://uinotes.com/
        // sample: https://uinotes-img.oss-cn-shanghai.aliyuncs.com/image/480-webp/316033985521534499.webp
        //      -> https://uinotes-img.oss-cn-shanghai.aliyuncs.com/image/origin/316033985521534499.jpg

        const reFind = /(.*)\/image\/.*\/(.*)\..*/;
        const reReplaceJpg = '$1/image/origin/$2.jpg';
        const reReplacePng = '$1/image/origin/$2.png';

        function findFullsizeUrl(link, src) {
            let fullsizeUrlJpg = src.replace(reFind, reReplaceJpg);
            let fullsizeUrlPng = src.replace(reFind, reReplacePng);

            link.data().hoverZoomSrc = [fullsizeUrlJpg, fullsizeUrlPng];
            res.push(link);
        }

        $('a img[src*="/image/"]').each(function() {
            findFullsizeUrl($(this), this.src);
        });

        if (res.length) {
            callback($(res), this.name);
        }
    }
});
