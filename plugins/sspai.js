var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'sspai',
    version:'1.0',
    prepareImgLinks:function (callback) {

        var res = [];

        // page with samples: https://sspai.com/post/76585
        // thumbnail:         https://cdn.sspai.com/2022/12/05/avatar/39c5fb65cfc26029f608dedea09596d5.png?imageMogr2/auto-orient/quality/95/thumbnail/!72x72r/gravity/Center/crop/72x72/interlace/1
        // fullsize:          https://cdn.sspai.com/2022/12/05/avatar/39c5fb65cfc26029f608dedea09596d5.png
        $('img[src]').one('mouseover', function() {
            var link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            let fullsize = this.src.replace(/(.*)\?.*/, '$1');
            link.data().hoverZoomSrc = [fullsize];
            callback(link, name);
            // Image is displayed iff the cursor is still over the link
            if (link.data().hoverZoomMouseOver)
                hoverZoom.displayPicFromElement(link);
        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        callback($(res), this.name);
    }
});