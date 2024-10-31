var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'gifbin',
    prepareImgLinks:function (callback) {
        let res = [];
        
        //TODO: Fix issue causing repeated warning: "Invalid URI. Load of media resource  failed."
        $('img[src*="/tn_"]').each(function () { 
            let img = $(this);
            let src = img.attr('src');

            src = src.replace('tn_', '').replace(/gif$/, 'webm')
            img.data().hoverZoomSrc = ['https://gifbin.com' + src];
            res.push(img);
        });

        callback($(res), this.name);
    }
});
