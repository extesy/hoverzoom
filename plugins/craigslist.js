var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Craigslist',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        $('span.ih[id^="images:"] ~ a').each(function () {
            var link = $(this);
            link.data().hoverZoomSrc = ['http://images.craigslist.org/' + link.siblings('span.ih').attr('id').substr(7)];
            res.push(link);
        });
        callback($(res));
    }
});