var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'YouTube',
    prepareImgLinks:function (callback) {
        var res = [],
            repl = 'http://i1.ytimg.com/vi/$1/0.jpg';

        function decodeQueryString(queryString) {
            var keyValPairs = queryString.split("&"), params = {};
            for (var i = 0; i < keyValPairs.length; i++) {
                var key = decodeURIComponent(keyValPairs[i].split("=")[0]);
                params[key] = decodeURIComponent(keyValPairs[i].split("=")[1] || "");
            }
            return params;
        }

        function decodeStreamMap(url_encoded_fmt_stream_map) {
            var streams = url_encoded_fmt_stream_map.split(","), sources = {};
            for (var i = 0; i < streams.length; i++) {
                var stream = decodeQueryString(streams[i]);
                var type = stream.type.split(";")[0];
                var quality = stream.quality.split(",")[0];
                stream.original_url = stream.url;
                stream.url = "" + stream.url + "&signature=" + stream.sig;
                sources["" + type + " " + quality] = stream;
            }
            return sources;
        }

        function getSource(sources, type, quality) {
            var lowest = null, exact = null;
            for (var key in sources) {
                var source = sources[key];
                if (source.type.match(type)) {
                    if (source.quality.match(quality)) {
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

            chrome.runtime.sendMessage({action: 'ajaxGet', url: location.protocol + "//www.youtube.com/get_video_info?video_id=" + id}, function (video_info) {
                link.removeClass('hoverZoomLoading');
                var video = decodeQueryString(video_info);
                if (video.status === "fail") {
                    console.log(video.reason);
                    return;
                }
                var sources = decodeStreamMap(video.url_encoded_fmt_stream_map);
                var src = getSource(sources, "webm", "hd720") || getSource(sources, "mp4", "hd720");
                if (src) {
                    link.data().hoverZoomSrc = [start ? src.url + '#t=' + start : src.url];
                    link.addClass('hoverZoomLink');
                    hoverZoom.displayPicFromElement(link);
                }
            });
        }

        $('a[href*="youtu.be/"]').one('mouseenter', function () {
            var link = $(this), match = this.href.match(/^.*youtu.be\/([\w-]+).*$/);
            if (!match || match.length < 2) return;
            prepareVideoPreview(link, match[1]);
        });

        $('a[href*="youtube.com/watch"]').one('mouseenter', function () {
            var link = $(this), match = this.href.match(/^.*v=([\w-]+).*$/);
            if (!match || match.length < 2) return;
            prepareVideoPreview(link, match[1]);
        });

        // $('a[href*="youtu.be/"] img').each(function () {
        //     var link = $(parentNodeName(this, 'a')),
        //         img = $(this);
        //     img.data().hoverZoomSrc = [link.attr('href').replace(/^.*youtu.be\/([\w-]+).*$/, repl)];
        //     res.push(img);
        // });

        // $('a[href*="youtube.com/watch"] img').each(function () {
        //     var link = $(parentNodeName(this, 'a')),
        //         img = $(this);
        //     img.data().hoverZoomSrc = [link.attr('href').replace(/^.*v=([\w-]+).*$/, repl)];
        //     res.push(img);
        // });

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
