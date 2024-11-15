var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'furrynetwork',
    version:'0.1',
    prepareImgLinks:function (callback) {
        let res = [];

        //Artwork and Photos
         $('img[data-reactid*="artwork"], img[data-reactid*="photo"]').each(function () {
            let img = $(this),
                src = img.attr('src');
            src = src.replace('315x315', '2500x1500');
            img.data().hoverZoomSrc = [src];
            res.push(img);
        });

        //Multimedia      
        $('img[data-reactid*="multimedia"]').each(function () {
            let img = $(this),
                src = img.attr('src');
            src = src.replace('/315x315.jpg', '');
            img.data().hoverZoomSrc = [src + '.gif', src + '.mp4', src + '.webm'];
            res.push(img);
        });

        callback($(res), this.name);
    }
});
