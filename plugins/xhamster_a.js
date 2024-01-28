var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'xhamster_a',
    version: '1.2',
    favicon:'xhamster.svg',
    prepareImgLinks: function(callback) {
        var name = this.name;

        // if header(s) rewrite is allowed store headers settings that will be used for rewrite
        if (options.allowHeadersRewrite) {
            chrome.runtime.sendMessage({action:"storeHeaderSettings",
                                        plugin:name,
                                        settings:
                                            [{"type":"request",
                                            "skipInitiator":"xhamster",
                                            "urls":["xhcdn.com", "doppiocdn.com", "cdn13.com"],
                                            "headers":[{"name":"referer", "value":"https://xhamster.com/", "typeOfUpdate":"add"}]},
                                            {"type":"response",
                                            "skipInitiator":"xhamster",
                                            "urls":["xhcdn.com", "doppiocdn.com", "cdn13.com"],
                                            "headers":[{"name":"Access-Control-Allow-Origin", "value":"*", "typeOfUpdate":"add"}]}]
                                        });
        }

        // lives hosted on xhamsterlive
        $('a[data-model-id], a[id]').filter(function() { return (/(xhamsterlive)/.test($(this).prop('href'))) }).one('mouseover', function() {
            var link = $(this);
            var href = this.href;
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            var modelId = this.dataset.modelId;
            if (modelId == undefined) {
                // e.g: id="model-list-item-116346143"
                // => modelId = 116346143
                let m = this.id.match(/-(\d+)/);
                if (m) {
                    modelId = m[1];
                }
            }
            if (modelId == undefined) return;
            var m3u8 = 'https://b-hls-11.doppiocdn.com/hls/' + modelId + '/' + modelId + '.m3u8';
            link.data().hoverZoomSrc = [m3u8];
            callback(link, name);
            // Image or video is displayed iff the cursor is still over the link
            if (link.data().hoverZoomMouseOver)
                hoverZoom.displayPicFromElement(link);
        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // links to lives hosted on xhamsterlive
        // sample: https://xhamsterlive.com/goto/yourssoumi?userId...
        // sample: https://xhamsterlive.com/sexyru_couple?userId...
        $('a[href*="xhamsterlive.com/"]').one('mouseover', function() {
            var link = $(this);
            var href = this.href;
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            var modelId = this.dataset.id;
            if (modelId == undefined) {
                // extract modelId from background image
                let bckgndImg = link.find('div[style*="strpst.com/thumbs/"]')[0];
                if (bckgndImg) {
                    let backgroundImage = bckgndImg.style.backgroundImage;
                    const reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
                    backgroundImage = backgroundImage.replace(reUrl, '$1');
                    let url = backgroundImage.replace(/^['"]/, "").replace(/['"]+$/, ""); // remove leading & trailing quotes
                    const re = /\/thumbs\/(\d+)\/(\d+)/;   // e.g: model id = 68327223
                    var m = url.match(re);
                    if (m) modelId = m[2];
                }
            }
            if (modelId == undefined) return;

            var m3u8 = 'https://b-hls-11.doppiocdn.com/hls/' + modelId + '/' + modelId + '.m3u8';
            link.data().hoverZoomSrc = [m3u8];
            callback(link, name);
            // Image or video is displayed iff the cursor is still over the link
            if (link.data().hoverZoomMouseOver)
                hoverZoom.displayPicFromElement(link);
        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // images hosted on xhamster
        // gallery link:    https://fr.xhamster.com/photos/gallery/a-compilation-of-my-photos-16031478
        // image link:      https://fr.xhamster.com/photos/gallery/16031478/514501398
        // src thumbnail:   https://thumb-p1.xhcdn.com/a/eKLh-_1dEs7Gh4c-95z9JA/000/506/206/131_100.jpg
        // src fullsize:    https://thumb-p1.xhcdn.com/a/Fs2HwXOgDcp_KeHnaCm21A/000/506/206/131_1000.jpg
        $('a[href*="/photos/gallery/"]').filter(function() { return (/(xhamster)/.test($(this).prop('href'))) }).one('mouseover', function() {
            var link = $(this);
            var href = this.href;
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            let galleryId = undefined;
            let imageId = undefined;
            const reImg = /\/photos\/gallery\/(\d+)\/(\d+)/;
            const reGallery = /\/gallery\/.*-(\d+)$/;
            var m = href.match(reImg);
            if (m) {
                galleryId = m[1];
                imageId = m[2];
            } else {
                 m = href.match(reGallery);
                 if (m) {
                     galleryId = m[1];
                 }
            }

            if (!galleryId && !imageId) return;

            // reuse previous result
            if (imageId) {
                if (link.data().hoverZoomXHamsterImageId == imageId) {
                    if (link.data().hoverZoomXHamsterImageSrc) link.data().hoverZoomSrc = [link.data().hoverZoomXHamsterImageSrc];
                    return;
                }
                link.data().hoverZoomXHamsterImageId = imageId;
                link.data().hoverZoomXHamsterImageSrc = undefined;
                // clean previous result
                link.data().hoverZoomSrc = [];
            } else {
                if (link.data().hoverZoomXHamsterGalleryId == galleryId) {
                    if (link.data().hoverZoomXHamsterGallerySrc) link.data().hoverZoomGallerySrc = link.data().hoverZoomXHamsterGallerySrc;
                    return;
                }
                link.data().hoverZoomXHamsterGalleryId = galleryId;
                link.data().hoverZoomXHamsterGallerySrc = undefined;
                // clean previous result
                link.data().hoverZoomGallerySrc = [];
            }

            function parseScript(doc) {
                if (doc.scripts['initials-script']) {
                    let initials = doc.scripts['initials-script'].text.replace('window.initials={', '{').replace('};', '}');
                    try {
                        let j = JSON.parse(initials);
                        let img = undefined;
                        let gallery  = undefined;
                        if (j["photosGalleryModel"]["photos"]["items"]) {
                            if (galleryId) {
                                if (j["photosGalleryModel"].id == galleryId) {
                                    gallery = j["photosGalleryModel"]["photos"]["items"];
                                    if (imageId) {
                                        img = j["photosGalleryModel"]["photos"]["items"].find(i => i.id == imageId);
                                    }
                                }
                            }
                        } else {
                            if (galleryId) {
                                if (j["photosGalleryModel"].id == galleryId) {
                                    gallery = j["photosGalleryModel"]["photos"];
                                    if (imageId) {
                                        img = j["photosGalleryModel"]["photos"].find(i => i.id == imageId);
                                    }
                                }
                            }
                        }
                        if (img) {
                            fullsizeUrl = img.imageURL;
                            let data = link.data();
                            data.hoverZoomSrc = [fullsizeUrl];
                            link.data().hoverZoomXHamsterImageSrc = fullsizeUrl;
                            callback(link, name);
                            // Image is displayed iff the cursor is still over the link
                            if (data.hoverZoomMouseOver)
                                hoverZoom.displayPicFromElement(link);
                        } else if (gallery) {
                            gallerySrc = [];
                            gallery.forEach(i => gallerySrc.push([i.imageURL]));
                            let data = link.data();
                            data.hoverZoomSrc = undefined;
                            data.hoverZoomGallerySrc = gallerySrc;
                            data.hoverZoomGalleryIndex = 0;
                            link.data().hoverZoomXHamsterGallerySrc = gallerySrc;
                            callback(link, name);
                            // Gallery is displayed iff the cursor is still over the link
                            if (data.hoverZoomMouseOver)
                                hoverZoom.displayPicFromElement(link);
                        }
                    } catch {}
                }
            }

            let fullsizeUrl = undefined;
            let gallerySrc = undefined;

            // search current document for fullsize url
            parseScript(document);

            if (fullsizeUrl || gallerySrc) return;

            // load link to extract fullsize url from document
            hoverZoom.prepareFromDocument(link, href, function(doc, callback) {
                parseScript(doc);
            }, true); // get source async

        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // xhamster user profile
        // sample: https://fr.xhamster.com/users/mannat_siddiqui
        $('a[href*="/users/"]').filter(function() { return (/(xhamster)/.test($(this).prop('href'))) }).one('mouseover', function() {
            var link = $(this);
            var href = this.href;
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            const re = /\/users\/([^\/\?]{1,})/;   // user id (e.g. mannat_siddiqui)
            var m = href.match(re);
            if (m == undefined) return;
            let userId = m[1];

            // reuse previous result
            if (link.data().hoverZoomXHamsterGalleryId == userId) {
                if (link.data().hoverZoomXHamsterGallerySrc) link.data().hoverZoomGallerySrc = link.data().hoverZoomXHamsterGallerySrc;
                return;
            }

            link.data().hoverZoomXHamsterGalleryId = userId;
            link.data().hoverZoomXHamsterGallerySrc = undefined;
            // clean previous result
            link.data().hoverZoomGallerySrc = [];

            function parseScript(doc) {
                if (doc.scripts['initials-script']) {
                    let initials = doc.scripts['initials-script'].text.replace('window.initials={', '{').replace('};', '}');
                    try {
                        let j = JSON.parse(initials);
                        let gallery  = undefined;
                        if (j["profileDatingPhotos"]) {
                            gallery = j["profileDatingPhotos"].photosList;
                        }
                        if (gallery) {
                            gallerySrc = [];
                            gallery.forEach(i => gallerySrc.push([i.detailURL]));
                            let data = link.data();
                            data.hoverZoomSrc = undefined;
                            data.hoverZoomGallerySrc = gallerySrc;
                            data.hoverZoomGalleryIndex = 0;
                            data.hoverZoomXHamsterGallerySrc = gallerySrc;
                            callback(link, name);
                            // Gallery is displayed iff the cursor is still over the link
                            if (data.hoverZoomMouseOver)
                                hoverZoom.displayPicFromElement(link);
                        }
                    } catch {}
                }
            }

            // load link to extract dating images gallery from document
            hoverZoom.prepareFromDocument(link, href, function(doc, callback) {
                parseScript(doc);
            }, true); // get source async

        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // images hosted on xhamsterlive (img)
        // sample:   https://static-cdn.strpst.com/photos/0/3/c/03cacae6b8609a7135b1654bfdd749f5-thumb
        // fullsize: https://static-cdn.strpst.com/photos/0/3/c/03cacae6b8609a7135b1654bfdd749f5
        $('img[src*="cdn.strpst.com/photos/"]').one('mouseover', function() {
            var link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            /*const discoDiv = $(this).parent('div[data-discover-post-id]')[0];
            if (discoDiv) {
                const discoId = discoDiv.dataset.discoverPostId;
                var url = `https://xhamsterlive.com/api/front/feed/model/${discoId}/discovery`; // e.g: https://fr.xhamsterlive.com/api/front/feed/model/143227032/discovery
                chrome.runtime.sendMessage({action:'ajaxGet', url:url}, function (response) {
                    if (response == null) { return; }
                });
            }*/
            let fullsize = this.src.replace('-thumb', '').replace('-preview', '');
            link.data().hoverZoomSrc = [fullsize];
            callback(link, name);
            // Image is displayed iff the cursor is still over the link
            if (link.data().hoverZoomMouseOver)
                hoverZoom.displayPicFromElement(link);
        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // images hosted on xhamsterlive (background-img)
        // sample:   https://static-cdn.strpst.com/photos/0/3/c/03cacae6b8609a7135b1654bfdd749f5-thumb
        // fullsize: https://static-cdn.strpst.com/photos/0/3/c/03cacae6b8609a7135b1654bfdd749f5
        $('[style*="cdn.strpst.com/photos/"]').one('mouseover', function() {
            var link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;
            let backgroundImage = this.style.backgroundImage;
            const reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            let fullsize = backgroundImage.replace(/^['"]/, "").replace(/['"]+$/, "").replace("-thumb", ""); // remove leading & trailing quotes
            link.data().hoverZoomSrc = [fullsize];
            callback(link, name);
            // Image is displayed iff the cursor is still over the link
            if (link.data().hoverZoomMouseOver)
                hoverZoom.displayPicFromElement(link);
        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // videos hosted on xhamster
        // sample: https://xhamster.com/videos/rhona-mitra-the-life-of-david-gale-915144
        $('a[href*="/videos/"], a[href*="/moments/"]').filter(function() { return (/(xhamster)/.test($(this).prop('href'))) }).one('mouseover', function() {
            var link = $(this);
            var href = this.href;
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            const re = /\/(videos|moments)\/([^\/\?]{1,})/;   // video id (e.g. rhona-mitra-the-life-of-david-gale-915144)
            var m = href.match(re);
            if (m == undefined) return;
            let videoId = m[2];

            link.data().hoverZoomCustomReferer = "https://xhamster.com/";

            // reuse previous result
            if (link.data().hoverZoomXHamsterVideoId == videoId) {
                if (link.data().hoverZoomXHamsterVideoSrc) link.data().hoverZoomSrc = [link.data().hoverZoomXHamsterVideoSrc];
                return;
            }
            link.data().hoverZoomXHamsterVideoId = videoId;
            link.data().hoverZoomXHamsterVideoSrc = undefined;
            // clean previous result
            link.data().hoverZoomSrc = [];

            hoverZoom.prepareFromDocument($(this), this.href, function(doc, callback) {

                let innerHTML = doc.documentElement.innerHTML;
                let token1 = 'window.initials={';
                let index1 = innerHTML.indexOf(token1);
                if (index1 != -1) {
                    let token2 = '</script>';
                    let index2 = innerHTML.indexOf(token2, index1);
                    let playinfo = innerHTML.substring(index1 + token1.length - 1, index2);
                    playinfo = playinfo.trim().replace(/;$/, '');
                    try {
                        let j = JSON.parse(playinfo);

                        let videoUrl = undefined;
                        if (j["videoModel"]["sources"]["mp4"]) {
                            videoUrl = j["videoModel"]["sources"]["mp4"]["2160p"];
                            if (videoUrl == undefined) videoUrl = j["videoModel"]["sources"]["mp4"]["1080p"];
                            if (videoUrl == undefined) videoUrl = j["videoModel"]["sources"]["mp4"]["720p"];
                            if (videoUrl == undefined) videoUrl = j["videoModel"]["sources"]["mp4"]["480p"];
                            if (videoUrl == undefined) videoUrl = j["videoModel"]["sources"]["mp4"]["240p"];
                            if (videoUrl == undefined) videoUrl = j["videoModel"]["sources"]["mp4"]["144p"];
                        }
                        if (videoUrl == undefined) {
                            let videoItem = j["xplayerSettings"]["sources"]["standard"]["h264"].find(s => s.quality == "1920p");
                            if (videoItem == undefined) videoItem = j["xplayerSettings"]["sources"]["standard"]["h264"].find(s => s.quality == "1440p");
                            if (videoItem == undefined) videoItem = j["xplayerSettings"]["sources"]["standard"]["h264"].find(s => s.quality == "960p");
                            if (videoItem == undefined) videoItem = j["xplayerSettings"]["sources"]["standard"]["h264"].find(s => s.quality == "720p");
                            if (videoItem)  videoUrl = videoItem.url;
                        }
                        if (videoUrl) {
                            let data = link.data();
                            data.hoverZoomSrc = [videoUrl];
                            data.hoverZoomXHamsterVideoSrc = videoUrl;
                            callback(videoUrl);
                            // Image is displayed iff the cursor is still over the link
                            if (data.hoverZoomMouseOver)
                                hoverZoom.displayPicFromElement(link);
                            return videoUrl;
                        }
                    } catch {}
                }
            }, true); // get source async
        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // videos hosted on xhamsterlive
        $('div[data-user-id][data-video-id].video-thumb').one('mouseover', function() {
            var link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            var userId = this.dataset.userId;
            var videoId = this.dataset.videoId;
            var url = 'https://xhamsterlive.com/api/front/users/' + userId + '/videos/' + videoId;

            chrome.runtime.sendMessage({action:'ajaxGet', url:url}, function (response) {

                if (response == null) { return; }
                try {
                    let j = JSON.parse(response);
                    var videoUrl = j.video.videoUrl;
                    if (videoUrl) {
                        link.data().hoverZoomSrc = [videoUrl];
                        callback(link, name);
                        // Image is displayed iff the cursor is still over the link
                        if (data.hoverZoomMouseOver)
                            hoverZoom.displayPicFromElement(link);
                    }
                } catch {}
            });
        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

    }
});
