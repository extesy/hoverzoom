var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Sky.it',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [],
            sky_n = 0,
            pics_data = [],
            hidden_links = $('div.hiddenlink a');

        if (hidden_links.length) {
            $.ajax({
                type:'GET',
                url:hidden_links.attr('href'),
                async:false,
                success:function (data) {
                    data = data.slice(data.indexOf('var pics_data') + 4);
                    data = data.slice(0, data.indexOf(']') + 1);
                    eval(data);
                }
            });
        }

        $('img[src*="/resized/"], a.opener_img').each(function () {
            var img = $(this),
                src = hoverZoom.getThumbUrl(this);

            if (src.substr(-4) != '.jpg')
                return;

            src = src.replace('/resized/', '/original/').replace(/_\d+x\d+\./, '.');
            img.data('hoverZoomSrc', [src]);

            if (pics_data && pics_data[sky_n] && pics_data[sky_n].description)
                img.data('hoverZoomCaption', pics_data[sky_n].description);
            sky_n++;

            res.push(img);
        });

        callback($(res));
    }
});
