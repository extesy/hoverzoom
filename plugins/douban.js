var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'Douban',
    prepareImgLinks: function(callback) {
        var res = [];
// http://img1.douban.com/view/photo/albumicon/public/p1236054384.jpg
// http://img1.douban.com/view/photo/photo    /public/p1236054384.jpg
        hoverZoom.urlReplace(res,
            'img[src*="albumicon"]',
            /albumicon/,
            'photo'
        );
// http://img3.douban.com/view/photo/thumb/public/p1008768576.jpg
// http://img3.douban.com/view/photo/photo/public/p1008768576.jpg
        hoverZoom.urlReplace(res,
            'img[src*="thumb"]',
            /thumb/,
            'photo'
        );
// http://img1.douban.com/spic/s6987994.jpg
// http://img1.douban.com/mpic/s6987994.jpg
// http://img1.douban.com/lpic/s6987994.jpg
        hoverZoom.urlReplace(res,
            'img[src*="spic"]',
            /spic/,
            'lpic'
        );
        hoverZoom.urlReplace(res,
            'img[src*="mpic"]',
            /mpic/,
            'lpic'
        );
// http://img3.douban.com/icon/u29449961-4.jpg
// http://img3.douban.com/icon/ul29449961-4.jpg
        hoverZoom.urlReplace(res,
            'img[src*="icon/u"]',
            /u([0-9]+-[0-9]+)\.jpg/,
            'ul$1.jpg'
        );
// http://img3.douban.com/view/commodity_story/imedium/public/p5950748.jpg
// http://img3.douban.com/view/commodity_story/medium/public/p5950748.jpg
        hoverZoom.urlReplace(res,
            'img[class="story-image"]',
            /imedium/,
            'medium'
        );
        callback($(res));
    }
});