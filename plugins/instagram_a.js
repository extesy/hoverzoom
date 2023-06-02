var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Instagram_a',
    version:'0.3',
    favicon:'instagram.svg',
    prepareImgLinks:function (callback) {

        const pluginName = this.name;

        // if header(s) rewrite is allowed store headers settings that will be used for rewrite
        if (options.allowHeadersRewrite) {
             chrome.runtime.sendMessage({action:"storeHeaderSettings",
                                        plugin:pluginName,
                                        settings:
                                            [{"type":"request",
                                            "skipInitiator":"instagram",
                                            "urls":["instagram"],
                                            "headers":[{"name":"referer", "value":"https://www.instagram.com/", "typeOfUpdate":"add"}]},
                                            {"type":"response",
                                            "skipInitiator":"instagram",
                                            "urls":["instagram"],
                                            "headers":[{"name":"Access-Control-Allow-Origin", "value":"*", "typeOfUpdate":"add"}]}]
                                        });
        }

        // pictures & videos
        // sample: https://lookaside.instagram.com/seo/google_widget/crawler/?media_id=2932322572918166182
        $('a[href*="lookaside.instagram.com"]:not(.hoverZoomMouseover)').addClass('hoverZoomMouseover').one('mouseover', function() {

            const href = this.href;
            const link = $(this);

            // clean previous result
            link.data().hoverZoomSrc = [];

            const re = /.*id=(.*)/
            const m = href.match(re);
            if (m == null) return;
            const mediaId = m[1];

            chrome.runtime.sendMessage({action:'ajaxGet',
                                        url:'https://www.instagram.com/api/v1/media/' + mediaId + '/info/',
                                        headers:[{"header":"X-IG-App-ID","value":"936619743392459"}],
                                        }, function (response) {

                                            try {
                                                const o = JSON.parse(response);
                                                const items0 = o.items[0];
                                                const videos = items0.video_versions;
                                                const images = items0.image_versions2;
                                                const carousel = items0.carousel_media;
                                                if (videos) {
                                                    // extract best quality video url
                                                    //sortResults(videos, 'width', false);
                                                    const videoUrl = videos[0].url + '.video';

                                                    // try to extract audio url (might not be present)
                                                    let audioUrl;
                                                    try {
                                                        if (items0.clips_metadata.original_sound_info) {
                                                            audioUrl = items0.clips_metadata.original_sound_info.progressive_download_url + '.audiomuted'; // there is already a soundtrack in video, this one is only for download
                                                        } else if (items0.clips_metadata.music_info) {
                                                            audioUrl = items0.clips_metadata.music_info.music_asset_info.progressive_download_url + '.audiomuted'; // there is already a soundtrack in video, this one is only for download
                                                        }
                                                    } catch {}

                                                    // try to extract subtitles url (might not be present)
                                                    let subtitlesUrl;
                                                    try {
                                                        if (items0.video_subtitles_uri) subtitlesUrl = items0.video_subtitles_uri + '.subtitles';
                                                    } catch {}

                                                    let videoAudioSubtitlesUrl = videoUrl;
                                                    if (audioUrl) videoAudioSubtitlesUrl += '_' + audioUrl;
                                                    if (subtitlesUrl) videoAudioSubtitlesUrl += '_' + subtitlesUrl;
                                                    link.data().hoverZoomCaption = (items0.caption ? items0.caption.text : (items0.accessibility_caption ? items0.accessibility_caption : fullname));
                                                    link.data().hoverZoomSrc = [videoAudioSubtitlesUrl];
                                                    callback(link, pluginName);
                                                    hoverZoom.displayPicFromElement(link);
                                                } else if (images) {
                                                    link.data().hoverZoomSrc = [images.candidates[0].url];
                                                    link.data().hoverZoomCaption = (items0.caption ? items0.caption.text : (items0.accessibility_caption ? items0.accessibility_caption : fullname));
                                                    callback(link, pluginName);
                                                    hoverZoom.displayPicFromElement(link);
                                                } else if (carousel) {
                                                    var gallery = [];
                                                    var captions = [];
                                                    const caption = (items0.caption ? items0.caption.text : (items0.accessibility_caption ? items0.accessibility_caption : fullname));
                                                    // carousel might mix images & videos
                                                    carousel.map(c => { gallery.push([c.video_versions ? c.video_versions[0].url : c.image_versions2.candidates[0].url]); captions.push(caption ?? ''); });
                                                    link.data().hoverZoomGallerySrc = gallery;
                                                    link.data().hoverZoomGalleryCaption = captions;
                                                    callback(link, pluginName);
                                                    hoverZoom.displayPicFromElement(link);
                                                }
                                            } catch { }
                                        }
            );
        });
    }
});
