var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'rule34video_a',
    version: '1.1',
    prepareImgLinks: function(callback) {
        var res = [];

        // if header(s) rewrite is allowed store headers settings that will be used for rewrite
        if (options.allowHeadersRewrite) {
            chrome.runtime.sendMessage({action:"storeHeaderSettings",
                                        plugin:name,
                                        settings:
                                            [{"type":"request",
                                            "skipInitiator":"rule34video",
                                            "urls":["rule34video"],
                                            "headers":[{"name":"referer", "value":"https://rule34video.com/", "typeOfUpdate":"add"}]}]
                                        });
        }

        // link:  https://rule34video.com/videos/3086641/step-by-step-of-sarada-sound-angel/
        // video: https://rule34video.com/get_file/6/e50e7782cd629cbbedad233e4b8379cd63d8c56ca4/3086000/3086641/3086641_1080p.mp4
        $('a[href*="rule34video"]:not(.hoverZoomMouseover)').addClass('hoverZoomMouseover').one('mouseover', function() {

            var link = undefined;
            var href = undefined;

            href = this.href;
            link = $(this);

            // clean previous result
            link.data().hoverZoomSrc = [];
            hoverZoom.prepareFromDocument($(this), this.href, function(doc) {

                let a = doc.querySelector('a[href*="_1080p.mp4"]');
                if (a) return a.href.replace(/(^https.*?_1080p.mp4).*/, '$1');
                a = doc.querySelector('a[href*="_720p.mp4"]');
                if (a) return a.href.replace(/(^https.*?_720p.mp4).*/, '$1');
                a = doc.querySelector('a[href*="_480p.mp4"]');
                if (a) return a.href.replace(/(^https.*?_480p.mp4).*/, '$1');
                a = doc.querySelector('a[href*="_360.mp4"]');
                if (a) return a.href.replace(/(^https.*?_360.mp4).*/, '$1');

            }, false); // get source sync
        });

        callback($(res), this.name);
    }
});
