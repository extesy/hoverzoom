var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'Douban',
    version:'0.3',
    favicon:'douban.ico',
    prepareImgLinks: function(callback) {
        var res = [];
// http://img1.douban.com/view/photo/albumicon/public/p1236054384.jpg
// http://img1.douban.com/view/photo/photo/public/p1236054384.jpg
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

        hoverZoom.urlReplace(res,
            'img[src]',
            /\/albumcover\//,
            '/original/'
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            /\/sq?x?s?\//,
            '/original/'
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            /\/(l|m|m_ratio_poster)\//,
            '/original/'
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            /\/s_/,
            '/'
        );

        hoverZoom.urlReplace(res,
            'div[style]',
            /\?image.*/,
            ''
        );

        // https://img1.doubanio.com/pview/event_poster/large/public/a5f81657a5dc0c7.jpg
        // https://img1.doubanio.com/pview/event_poster/raw/public/a5f81657a5dc0c7.jpg
        hoverZoom.urlReplace(res,
            'img[src]',
            /\/(small|medium|large)\//,
            '/raw/'
        );

        callback($(res), this.name);
    }
});