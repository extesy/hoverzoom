var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Flickr',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        $('#findr .fumb img:visible, .batch_photo_img_div img').each(function () {
            var _this = $(this),
                div = _this.parents('div:eq(0)'),
                src = _this.attr('src');
            src = src.replace(/_[mst]\./, '.');
            div.data().hoverZoomSrc = [src];
            div.mouseover(function () {
                $(this).addClass('hoverZoomLink');
            });
            res.push(div);
            if (options.showHighRes) {
                hoverZoomPluginFlickerA.prepareImgLinkFromSrc(div);
            }
        });
        callback($(res));
    }
});