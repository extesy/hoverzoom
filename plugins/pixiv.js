var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'Pixiv',
    version:'3.2',
    favicon:'pixiv.svg',
    prepareImgLinks: function (callback) {
        var name = this.name;

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
         * Erases non-existent URLs from the hoverZoomGallerySrc array.
         *
         * This is done asynchronously, so there's no delay introduced by the checks.
         * The first image in an album will load a bit slowly if it's a jpg (because
         * HZ will try to the load png, fail, then fall back to the jpg), but the rest
         * should be instant, especially with gallery preloading.
         */
        function fixGalleryUrls(galleryUrls, jcontainer) {
            // If the user hasn't specified that they want to see high-res images,
            // there's nothing for this function to do, since galleryUrls will
            // only include master1200 thumbnails, which always exist.
            if(!options.showHighRes) {
                return;
            }

            cLog(`Fixing ${galleryUrls.length} imaages...`);

            /**
             * Recursive function that checks for the existence of the full-size png
             * version of each image, and deletes it from hoverZoomGallerySrc if it
             * doesn't. Then it does the same for the full-size jpg version.
             * Then it moves on to the next image in the gallery, until the gallery
             * processing is finished.
             */
            function processNext(index) {
                // Stop recursing when we reach the end of the gallery.
                if (index >= galleryUrls.length) {
                    return;
                }

                cLog(`Checking if ${galleryUrls[index][0]} exists...`);
                fetch(galleryUrls[index][0], { method: 'HEAD' })
                    .then((response) => {
                        if (!response.ok) {
                            // The PNG doesn't exist, so remove it from the array.
                            cLog(`Full-size PNG doesn't exist. Removing it for image #${index + 1}.`);
                            galleryUrls[index].shift()
                            // Now check the jpg, which is now the first one in the array.
                            cLog(`Checking if ${galleryUrls[index][0]} exists...`);
                            fetch(galleryUrls[index][0], {method: 'HEAD'})
                                .then((response) => {
                                    if (!response.ok) {
                                        // Thee jpg doesn't exist either?
                                        // Weird, but OK. Remove it, too.
                                        galleryUrls[index].shift()
                                        console.log(`Full-size JPG doesn't exist. Removing it for image #${index + 1}.`);
                                    }
                                    // The above code updated galleryUrls, so we can now replace
                                    // hoverZoomGallerySrc with the updated version.
                                    jcontainer.data('hoverZoomGallerySrc', galleryUrls)
                                })
                        }
                    })
                    .finally(() => {
                        // After the image is done processing, move on to the next one in the gallery.
                        processNext(index + 1);
                    });
            }
            // Start recursing from the first image.
            processNext(0);
        }


        /**
         * jQuery one listener
         * only
         */
        const imageElements = $(selector.thumbnail)
        imageElements.one('mouseover', function () {
            const jcontainer = $(this)

            // stop function if data already bound
            if(jcontainer.data().hoverZoomGallerySrc) return;
            const containerString = this.outerHTML

            const data = getData(containerString)
            // abort if the data not found
            if(!data) {
                return;
            }

            // get the image count
            const imageCount = getImgCount(containerString)
            const galleryUrls = []

            // Loop through image number
            for (let i = 0; i < imageCount; i++) {
                // These are the two types of images that might be found in a Pixiv gallery.
                // Pixiv does allow you to upload GIF files, but they don't support animated
                // GIF, so nobody actually does this.
                const hiResUrls = {
                    originalJPG: `https://i.pximg.net/img-original/img/${data.date}/${data.id}_p${i}.jpg`,
                    originalPNG: `https://i.pximg.net/img-original/img/${data.date}/${data.id}_p${i}.png`,
                }
                // Use only the master1200 thumbnail jpg by default. This URL always exists.
                const urls = [`https://i.pximg.net/img-master/img/${data.date}/${data.id}_p${i}_master1200.jpg`]

                // If the user has chosen to display highRes images, display the original PNG by default,
                // falling back to the original jpg if that doesn't exist, and the master1200 thumbnail
                // if, somehow, neither of the originals exist.
                if(options.showHighRes) {
                    urls.unshift(hiResUrls.originalPNG, hiResUrls.originalJPG);
                }
                galleryUrls.push(urls)
            }

            fixGalleryUrls(galleryUrls, jcontainer);

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

        // preview
        $('img[src*="img-master"]').filter(function() { return $(this).parents("a").length == 0 }).each(function() {

            let link = $(this);
            let data = link.data();

            let fullsize = this.src.replace(/^.*img-master\/(.*_p\d+).*\.(.*)/, 'https://i.pximg.net/img-original/$1.$2');
            data.hoverZoomSrc = [fullsize];
            link.addClass('hoverZoomLinkFromPlugIn');
            res.push(link);

        });

        // videos = sequence of still images in a zip file
        // sample:   https://www.pixiv.net/en/artworks/104956863
        // video id: 104956863
        $('img').siblings('svg').parents('a[href*="/artworks/"]:not(.hoverZoomMouseover)').addClass('hoverZoomMouseover').each(function() {
            $(this).one('mouseover', function() {

                var link = this;
                link = $(link);
                var img = link.find('img')[0];
                img = $(img);
                const href = this.href;
                const re = /\/artworks\/(\d+)/;
                const m = href.match(re);
                if (m == null) return;
                const id = m[1];

                // find zip url
                $.ajax({
                    type: "GET",
                    dataType: 'text',
                    url: 'https://www.pixiv.net/ajax/illust/' + id + '/ugoira_meta',
                    success: function(response) {
                        try {
                            const j = JSON.parse(response);
                            const zipUrl = j.body.originalSrc || j.body.src;
                            handleZip(zipUrl, link, img);
                        } catch {}
                    },
                    error: function(response) { }
                })
            })
        });

        // download zip file & display content as a gallery (static, no animation)
        function handleZip(zipUrl, link, img) {

            fetch(zipUrl)
                .then(handleResponse)
                .catch(function(error) {
                    cLog(error);
                });

            function handleResponse(response) {
                if (response.ok) {
                    response.blob()
                    .then(blob => blob.arrayBuffer())
                    .then(buffer => {
                        // load zip file with JSZip library
                        JSZip.loadAsync(buffer).then(function (zip) {
                            var gallery = [];
                            var nbFiles = 0;
                            zip.forEach(function(f) { nbFiles++ });
                            var cnt = 0;
                            zip.forEach(function(f) {
                                zip.file(f).async('uint8array').then(function(data) {
                                    // convert each file to Blob
                                    const blobBin = new Blob([data], {type:'application/octet-stream'});
                                    const blobUrl = URL.createObjectURL(blobBin);
                                    gallery.push([blobUrl]);
                                    if (++cnt == nbFiles) {
                                        link.data().hoverZoomSrc = undefined;
                                        link.data().hoverZoomGallerySrc = gallery;
                                        link.data().hoverZoomGalleryIndex = 0;
                                        callback(link, this.name);
                                        hoverZoom.displayPicFromElement(link);
                                    }
                                })
                            })
                        })
                    })
                }
            }
        }

        if (res.length) {
            callback($(res), this.name);
        }

    }
});
