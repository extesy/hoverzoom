var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'Pixiv',
    version:'3.1',
    prepareImgLinks: function (callback) {
        var name = this.name;

        // if header(s) rewrite is allowed store headers settings that will be used for rewrite
        if (options.allowHeadersRewrite) {
            chrome.runtime.sendMessage({action:"storeHeaderSettings",
                                        plugin:name,
                                        settings:
                                            [{"type":"request",
                                            "skipInitiator":"pixiv",
                                            "url":"pximg.net",
                                            "headers":[{"name":"referer", "value":"https://www.pixiv.net/", "typeOfUpdate":"add"}]},
                                            {"type":"response",
                                            "skipInitiator":"pixiv",
                                            "url":"pximg.net",
                                            "headers":[{"name":"Access-Control-Allow-Origin", "value":"*", "typeOfUpdate":"add"}]}]
                                        });
        }

        // the element selector
        const selector = {
            thumbnail: 'a[href*="/artworks/"], a[href*="member_illust.php?mode="], a[href*="/group/"]',
        }

        /**
         * extract image count from html string
         * Example :
         * html string : ...-fzXfOs bAzGJS">25</span></div>...
         * Captures:
         * Group 1 : 25
         */
        //
        const imageCountRegex = />(\d+)<\/span/
        function getImgCount(containerStr) {
            const match = containerStr.match(imageCountRegex)
            if(match != null) {
                // Parse the String
                return parseInt(match[1])
            }
            return 1
        }

        /**
         * get the date and id from url of thumbnail
         * it will search from html string
         *
         * Example Urls : https://i.pximg.net/c/150x150/img-master/img/2019/09/19/11/04/57/76858051_p0_master1200.jpg
         * Group 1      : (the date) 2019/09/19/11/04/57
         * Group 3      : (the id) 76858051
         */
        const urlregex = /\/img\/(\d+\/(\d\d\/?(?!\d{3})){5})\/(\d+)_/
        function getData(containerStr) {
            const match = containerStr.match(urlregex)
            if (match != null)
                return {
                    date: match[1],
                    id: match[3]
                }
        }

        /**
         * jQuery one listener
         * only
         */
        const imageElements = $(selector.thumbnail)
        imageElements.one('mouseover', function () {
            const jcontainer = $(this)

            // stop function if data already bind
            if(jcontainer.data().hoverZoomGallerySrc) return;
            const containerString = this.outerHTML

            const data = getData(containerString)
            // abort if the data not found
            if(!data) return

            // get the image count
            const imageCount = getImgCount(containerString)
            const galleryUrls = []

            // Loop through image number
            for (let i = 0; i < imageCount; i++) {
                const url = {
                    original: `https://i.pximg.net/img-original/img/${data.date}/${data.id}_p${i}.jpg`,
                    regular: `https://i.pximg.net/img-master/img/${data.date}/${data.id}_p${i}_master1200.jpg`
                }
                const urls = [url.regular]

                /**
                 * unshift original value if options showHighRes is true
                 * so its loaded first
                */
                if(options.showHighRes) {
                    urls.unshift(url.original)
                }
                galleryUrls.push(urls)
            }
            jcontainer.data('hoverZoomGallerySrc', galleryUrls)

            callback($([jcontainer]))
        })


        var res = [];

        // user profile
        // sample:   https://i.pximg.net/user-profile/img/2021/08/28/02/44/33/21309524_fa9dbf2139f21008fed22e85eb406285_50.png
        // original: https://i.pximg.net/user-profile/img/2021/08/28/02/44/33/21309524_fa9dbf2139f21008fed22e85eb406285.png
        hoverZoom.urlReplace(res,
            'img[src],[style*="url"]',
            /(\/user-profile\/.*)_\d+\./,
            '$1.',
            'a'
        );

        // booth
        // sample:   https://booth.pximg.net/c/300x300_a2_g5/7684ea57-1144-4938-9b81-f6cb7688d683/i/3349359/84ac0b91-4b42-4ae1-a5b7-549d163cbd33_base_resized.jpg
        // original: https://booth.pximg.net/7684ea57-1144-4938-9b81-f6cb7688d683/i/3349359/84ac0b91-4b42-4ae1-a5b7-549d163cbd33_base_resized.jpg
        hoverZoom.urlReplace(res,
            'img[src],[style*="url"]',
            /booth\.pximg\.net\/.*?\/.*?\//,
            'booth.pximg.net/',
            'a'
        );

        // novel, imgaz
        // sample:   https://i.pximg.net/c/600x600/novel-cover-master/img/2021/04/08/15/34/41/15007597_21fda528ee2782885384385d50bcd9f5_master1200.jpg
        // original: https://i.pximg.net/novel-cover-master/img/2021/04/08/15/34/41/15007597_21fda528ee2782885384385d50bcd9f5_master1200.jpg
        hoverZoom.urlReplace(res,
            'img[src],[style*="url"]',
            /i\.pximg\.net\/.*?\/.*?\/(novel|imgaz)/,
            'i.pximg.net/$1',
            'a'
        );

        // sketch
        // sample:   https://img-sketch.pximg.net/c!/w=120,h=120,f=webp:jpeg/uploads/medium/file/9030309/sq800_1008336241213197030.png
        // original: https://img-sketch.pximg.net/uploads/medium/file/9030309/1008336241213197030.png
        hoverZoom.urlReplace(res,
            'img[src],[style*="url"]',
            [/img-sketch\.pximg\.net\/.*?\/.*?\//, /sq\d+_/],
            ['img-sketch.pximg.net/', ''],
            'a'
        );

        // single images (not included in a gallery)
        hoverZoom.urlReplace(res,
            'a:not([href*="/artworks/"]):not([href*="member_illust.php?mode="]):not([href*="/group/"]) img[src], a:not([href*="/artworks/"]):not([href*="member_illust.php?mode="]):not([href*="/group/"]) div[src], [style*="url"]',
            /\.pximg\.net\/.*?\/.*?\/(.*)/,
            '.pximg.net/$1'
        );

        // live streams
        // sample: https://sketch.pixiv.net/@silvercoin1911/lives/1317584211526544880
        $('a[href*="/lives/"]').filter(function() { return (/@.*?\/lives\/\d+/.test($(this).attr('href'))) }).one('mouseover', function() {

            var link = this;
            link = $(link);

            // call api
            var re = /\/lives\/(\d+)/;
            var m = link.attr('href').match(re);
            if (m == null) return;
            var id = m[1];
            var url = "https://sketch.pixiv.net/api/lives/" + id + ".json";

            $.ajax({
                type: "GET",
                dataType: 'text',
                url: url,
                success: function(response) {

                    try {
                        urlPlaylist = JSON.parse(response).data.owner.hls_movie.url;
                        let data = link.data();
                        data.hoverZoomSrc = [urlPlaylist];
                        callback(link, name);
                        hoverZoom.displayPicFromElement(link);
                    } catch {}
                },
                error: function(response) { }
            })
        });

        if (res.length) {
            callback($(res), this.name);
        }
    }
});