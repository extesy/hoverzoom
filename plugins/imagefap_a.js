var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Imagefap_a',
    version:'0.3',
    prepareImgLinks:function (callback) {
        var res = [];

        // if header(s) rewrite is allowed store headers settings that will be used for rewrite
        if (options.allowHeadersRewrite) {
            chrome.runtime.sendMessage({action:"storeHeaderSettings",
                                        plugin:name,
                                        settings:
                                            [{"type":"request",
                                            "skipInitiator":"imagefap",
                                            "url":"moviefap.com",
                                            "headers":[{"name":"referer", "value":"https://www.imagefap.com", "typeOfUpdate":"add"}]}]
                                        });
        }

        // images
        // page hosting thumbnail img: https://www.imagefap.com/photo/58046625/
        // thumbnail img:              https://cdn.imagefap.com/images/mini/111/658/65819236.jpg?end=1659223634&secure=04cba344d9553fef9d3f7
        // fullsize img:               https://cdnh.imagefap.com/images/full/111/658/65819236.jpg?se=1659221053&ss=cb174054cfb27b7d1b16256380d0f5fc
        $('img[src*="imagefap.com/images/"]:not(.hoverZoomMouseover), a[href*="imagefap.com/images/"]:not(.hoverZoomMouseover)').addClass('hoverZoomMouseover').one('mouseover', function() {

            var thumb = this.src || this.href;
            var link = $(this);

            const re = /\/images\/.*\/(\d+)\./;   // image id (e.g. 65819236)
            var m = thumb.match(re);
            if (m == undefined) return;
            let imageId = m[1];

            var phpLink = 'https://www.imagefap.com/image.php?id=' + imageId;

            // clean previous result
            link.data().hoverZoomSrc = [];
            hoverZoom.prepareFromDocument($(this), phpLink, function(doc, callback) {

                let img = doc.querySelector('img#mainPhoto');
                if (img) {
                    callback(img.src);
                    hoverZoom.displayPicFromElement(link, true);
                }

            }, true); // get source async
        });

        // profiles
        // profile url: https://www.imagefap.com/profile/Bluehywy
        // profile url: https://www.imagefap.com/profile.php?user=violetayazul69
        $('a[href*="/profile/"]:not(.hoverZoomMouseover), a[href*="/profile.php"]:not(.hoverZoomMouseover)').filter(function() { return (/imagefap\.com\/profile/.test($(this).prop('href'))) }).addClass('hoverZoomMouseover').one('mouseover', function() {

            var profileLink = this.href;
            var link = $(this);

            // clean previous result
            link.data().hoverZoomSrc = [];
            hoverZoom.prepareFromDocument($(this), profileLink, function(doc, callback) {

                let a = doc.querySelector('a.blk_profile');
                if (a) callback(a.href);
                hoverZoom.displayPicFromElement(link);

            }, true); // get source async
        });

        // videos (inspired from Imagus's sieve: R_ImageFap_v)
        // video url: https://www.imagefap.com/video.php?vid=694269
        $('a[href*="/video.php"]:not(.hoverZoomMouseover)').filter(function() { return (/imagefap\.com\/video/.test($(this).prop('href'))) }).addClass('hoverZoomMouseover').one('mouseover', function() {

            var videoLink = this.href;
            var link = $(this);

            // clean previous result
            link.data().hoverZoomSrc = [];
            hoverZoom.prepareFromDocument($(this), videoLink, function(doc, callback) {

                // extraction of url associated to video player
                let playerUrl = doc.documentElement.innerHTML.match(/var VideoPlayer ?=[\s\S]+?url: ?'([^']+)'/)[1];
                if (!playerUrl) return;

                chrome.runtime.sendMessage({action:'ajaxGet', url:playerUrl}, function (response) {

                    if (response == null) { return; }

                    // parse XML to extract video url (urls are sorted: last one = best one)
                    const parser = new DOMParser();
                    const xml = parser.parseFromString(response, "application/xml");
                    let videoFileSources = xml.getElementsByTagName('quality')[0];
                    if (videoFileSources) {
                        videoFileSources = videoFileSources.getElementsByTagName('item');
                        let videoUrl = videoFileSources[videoFileSources.length-1].getElementsByTagName('videoLink')[0].childNodes[0].nodeValue;
                        if (videoUrl) callback(videoUrl);
                        hoverZoom.displayPicFromElement(link);
                    }
                });

            }, true); // get source async
        });

        callback($(res), this.name);
    }
});
