var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'screencast_a',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // page with samples: https://www.reddit.com/domain/screencast.com/
        // link:              https://www.screencast.com/t/dXz0bSAkRg5u
        // video url:         https://content.screencast.com/users/RugcleaningChica/folders/Default/media/bb940e12-6e01-4b06-928e-88a10e137f36/Oriental_rug_Cleaning_Chicago.mp4
        $('a[href*="/t/"]:not(.hoverZoomMouseover), a[href*="/users/"]:not(.hoverZoomMouseover)').filter(function() { return (/screencast\.com/.test($(this).prop('href'))) }).addClass('hoverZoomMouseover').one('mouseover', function() {

            href = this.href;
            link = $(this);

            hoverZoom.prepareFromDocument($(this), this.href, function(doc) {

                let meta = doc.querySelector('meta[property="og:video"]');
                if (meta) return meta.content;

            }, false); // get source sync
        });

        callback($(res), this.name);
    }
});
