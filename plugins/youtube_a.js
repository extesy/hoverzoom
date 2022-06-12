var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'YouTube',
    prepareImgLinks:function (callback) {
        var res = [];

        function getSource(sources, type, quality) {
            var lowest = null, exact = null;
            for (var source of sources) {
                if (source.mimeType.indexOf(type) !== -1) {
                    if (source.quality.indexOf(quality) !== -1) {
                        exact = source;
                    } else {
                        lowest = source;
                    }
                }
            }
            return exact || lowest;
        }

        function prepareVideoPreview(link, id) {
            if (link.hasClass('hoverZoomLoading') || link.hasClass('hoverZoomLink') || link.hasClass('ytp-title-link')) return;
            link.addClass('hoverZoomLoading');

            var match = link.attr('href').match(/[\?&]t=([\dhm]+)/);
            var start = match && match.length >= 2 ? match[1] : null;
            if (start && start.indexOf('m') !== -1) {
                var parts = start.split('m');
                if (parts.length == 2) {
                    var parts2 = start.split('h');
                    if (parts2.length == 2)
                        parts[0] = parseInt(parts2[0]) * 60 + parseInt(parts2[1]);
                    start = parseInt(parts[0]) * 60 + parseInt(parts[1] || 0);
                }
            }

            chrome.runtime.sendMessage({action:'ajaxGet', url: 'https://www.youtube.com/watch?v=' + id}, function(data) {
                link.removeClass('hoverZoomLoading');
                const match = data.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\})\s*;/);
                if (match && match.length >= 2) {
                    const json = JSON.parse(match[1]);
                    const formats = json.streamingData.formats;
//                    const adaptiveFormats = json.streamingData.adaptiveFormats;
                    let src = getSource(formats, "mp4", "hd1080") || getSource(formats, "webm", "hd1080");
//                        || getSource(adaptiveFormats, "webm", "hd720") || getSource(adaptiveFormats, "mp4", "hd720");
                    if (src && src.url) {
                        link.data().hoverZoomSrc = [start ? src.url + '#t=' + start : src.url];
                        link.addClass('hoverZoomLink');
                        hoverZoom.displayPicFromElement(link);
                    }
                }
            });
        }

        $('a[href*="youtu.be/"]').one('mouseenter', function () {
            var link = $(this), match = this.href.match(/^.*youtu.be\/([\w-]+).*$/);
            if (!match || match.length < 2) return;
            prepareVideoPreview(link, match[1]);
        });

        $('a[href*="youtube.com/shorts/"]').one('mouseenter', function () {
            var link = $(this), match = this.href.match(/^.*\/shorts\/([\w-]+).*$/);
            if (!match || match.length < 2) return;
            prepareVideoPreview(link, match[1]);
        });

        $('a[href*="youtube.com/watch"]').one('mouseenter', function () {
            var link = $(this), match = this.href.match(/^.*v=([\w-]+).*$/);
            if (!match || match.length < 2) return;
            prepareVideoPreview(link, match[1]);
        });

        hoverZoom.urlReplace(res,
            'img[src*="ytimg.com/vi/"], img[src*="ytimg.com/vi_webp/"]',
            /\/([1-9]|default|hqdefault|mqdefault)\.(jpg|webp)/,
            '/0.$2'
        );

        $('a img[data-thumb*="ytimg.com/vi/"]').each(function () {
            var img = $(this);
            img.data().hoverZoomSrc = [this.getAttribute('data-thumb').replace(/\/([1-9]|default|hqdefault|mqdefault)\.jpg/, '/0.jpg')];
            res.push(img);
        });

        callback($(res));
    }
});
