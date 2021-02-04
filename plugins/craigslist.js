var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Craigslist',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        
        $('span.ih[id^="images:"] ~ a').each(function () {
            var link = $(this);
            link.data().hoverZoomSrc = ['http://images.craigslist.org/' + link.siblings('span.ih').attr('id').substr(7)];
            res.push(link);
        });
                
        hoverZoom.urlReplace(res,
            'img[src]',
            ['_300x300', '_600x450', '_50x50c'],
            ['_1200x900', '_1200x900', '_1200x900']
        );
        
        callback($(res), this.name);
    }
});