var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'jike',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var pluginName = this.name;
        var res = [];

        // https://imgjike.ui.cn/data/singles/9382d37a6bf01fa9f68fc952ae55e60c.png?imageView/1/w/230/h/498
        // => https://imgjike.ui.cn/data/singles/9382d37a6bf01fa9f68fc952ae55e60c.png
        // https://imgavater.ui.cn/avatar/1/5/8/3/1903851.jpg?imageMogr2/auto-orient/crop/!840x840a54a3/thumbnail/60x60
        // => https://imgavater.ui.cn/avatar/1/5/8/3/1903851.jpg
        
        $('img[src*="/data/"], img[src*="/avatar/"]').one('mouseover', function() {
            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;
            const src = this.src;
            const fullsizeUrl = src.replace(/(.*)\?.*/, '$1');

            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                link.data().hoverZoomSrc.unshift(fullsizeUrl);
                link.data().hoverZoomJikeImgUrl = fullsizeUrl;
            }

            callback(link, pluginName);
            // Image or video is displayed iff the cursor is still over the link
            if (link.data().hoverZoomMouseOver)
                hoverZoom.displayPicFromElement(link);

        }).one('mouseleave', function() {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        callback($(res), this.name);
    }
});
