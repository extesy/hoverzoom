var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'lummi',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample: https://assets.lummi.ai/assets/Qmbk569usQHq44j6vqugBoLSaiof2xJ7CFmo51o7J9kVCs?auto=format&w=1500
        //      -> https://assets.lummi.ai/assets/Qmbk569usQHq44j6vqugBoLSaiof2xJ7CFmo51o7J9kVCs?auto=format&w=9999 => max w = 4991 px

        const reFind = /(.*\.lummi\.ai\/.*)\?.*/;
        const reReplace = '$1?auto=format&w=9999';

        $('a').one('mouseover', function() {

            const link = $(this);

            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            var img = undefined;

            if (link.find('a').length == 0) {
                img = link.find('img[src]')[0]; // img is under link
                if (img == undefined) {
                    img = link.siblings().find('img').filter(function() { return $(this).parents('a').length == 0 })[0]; // img is next to link
                }
            }
            if (img == undefined) return;

            let fullsizeUrl = img.src.replace(reFind, reReplace);

            link.addClass('hoverZoomLink');
            link.data().hoverZoomSrc = [fullsizeUrl];
            // Image is displayed iff the cursor is still over the image
            if (link.data().hoverZoomMouseOver) {
                hoverZoom.displayPicFromElement(link);
            }

        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        if (res.length) {
            callback($(res), this.name);
        }
    }
});
