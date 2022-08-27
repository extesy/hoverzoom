var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'sendvid_a',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // page with samples: https://www.reddit.com/domain/sendvid.com/
        // link:              https://sendvid.com/665lln74
        // video url:         https://videos2-h.sendvid.com/hls/8a/4a/665lln74.mp4/master.m3u8?validfrom=1661590630&validto=1661597830&rate=200k&ip=93.22.151.198&hdl=-1&hash=utkq1owE7t%2FxnV4jKV0ar%2FYthK4%3D
        $('a[href*="sendvid.com"]:not(.hoverZoomMouseover)').addClass('hoverZoomMouseover').one('mouseover', function() {

            href = this.href;
            link = $(this);

            hoverZoom.prepareFromDocument($(this), this.href, function(doc) {

                let meta = doc.querySelector('meta[property="og:video:secure_url"]');
                if (meta) return meta.content;

            }, false); // get source sync
        });

        callback($(res), this.name);
    }
});
