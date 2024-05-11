var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Freepik',
    version:'0.3',
    prepareImgLinks:function (callback) {
        var res = [];

        $('a img[src*="/th/"]').each(function() {
            var img = this,
                link = $(this).parents('a')[0],
                imgNum = img.src.match(/th\/(.*)\./)[1];
            link = $(link);
            var url = link.prop('href');
            url = url.replace(/_\d+\.htm/, '_' + imgNum + '.jpg').replace('//www.', '//static.');
            link.data().hoverZoomSrc = [url];
            res.push(link);
        });

        $('a img[src]:not(.avatar-img), img[src]:not(.avatar-img)').each(function() {
            var img = this,
                link = $(this).parents('a')[0],
                url = img.src;
            link = link == undefined ? $(this) : $(link);
            url = url.replace(/\.(jpe?g|png|svg).*/, '.$1?w=5000');
            if (url.indexOf('.png') != -1) url = url.replace(/\/(128|256)\// , '/512/'); // for icons only
            link.data().hoverZoomSrc = [url];
            res.push(link);
        });

        // videos
        $('a video source[data-src]').each(function() {
            var source = this,
                link = $(this).parents('a')[0],
                url = source.dataset.src;
            link = $(link);
            link.data().hoverZoomSrc = [url];
            res.push(link);
        });

        callback($(res), this.name);
    }
});