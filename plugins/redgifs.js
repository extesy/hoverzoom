var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'redgifs.com',
    version:'0.4',
    prepareImgLinks:function (callback) {
    name: 'redgifs.com',
    version: '0.4',
    prepareImgLinks: function(callback) {
        var self = this;
        var res = [];
        var name = this.name;
@@ -16,7 +16,21 @@ hoverZoomPlugins.push({
            });
        }

        $('a[href*="redgifs.com/"]').one('mouseenter', function () {
        if (options.allowHeadersRewrite) {
            chrome.runtime.sendMessage({
                action: "storeHeaderSettings",
                plugin: 'custom',
                settings:
                    [{
                        "skipInitiator":"redgifs",
                        "type": "request",
                        "urls": ["redgifs.com"],
                        "headers": [{ "name": "referer", "typeOfUpdate": "remove" }]
                    }]
            });
        }

        $('a[href*="redgifs.com/"]').one('mouseenter', function() {
            const link = $(this);
            const gfyId = this.href.replace(/.*redgifs.com\/(..\/)?(\w+\/)?(\w+)(?:\.\w+)?/, '$3');

@@ -65,12 +79,16 @@ hoverZoomPlugins.push({
            let videoUrlMobile = src;
            let videoUrlBestQuality = videoUrlMobile.replace('-mobile', '');
            let videoUrl = videoUrlMobile + '.video';
            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (link.data().hoverZoomSrc == undefined) {
                link.data().hoverZoomSrc = []
            }
            if (link.data().hoverZoomSrc.indexOf(videoUrl) == -1) {
                link.data().hoverZoomSrc.unshift(videoUrl);
            }
            videoUrl = videoUrlBestQuality + '.video';
            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (link.data().hoverZoomSrc == undefined) {
                link.data().hoverZoomSrc = []
            }
            if (link.data().hoverZoomSrc.indexOf(videoUrl) == -1) {
                link.data().hoverZoomSrc.unshift(videoUrl);
            }
            callback(link, name);
            hoverZoom.displayPicFromElement(link);
        });
        if (res.length) {
            callback($(res), name);
        }
    }
});
