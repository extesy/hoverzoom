var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'e621',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        $('article[data-file-url]').each(function () {
            var article = $(this);
                img = article.find('img');
            img.data().hoverZoomSrc = [article.attr('data-file-url')];
            res.push(img);
        });
        callback($(res));
    }
});