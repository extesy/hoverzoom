var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'moddb',
    version: '1.0',
    prepareImgLinks: function(callback) {
        var res = [];

        // smallest img: https://media.moddb.com/cache/images/mods/1/28/27800/crop_120x90/2CjGu.png
        // small img:    https://media.moddb.com/cache/images/mods/1/28/27800/thumb_620x2000/2CjGu.png
        // fullsize img: https://media.moddb.com/images/mods/1/28/27800/2CjGu.png
        hoverZoom.urlReplace(res,
            'img[src*="/cache/"]:not(img[src*=".avi"]):not(img[src*=".flv"]):not(img[src*=".mov"]):not(img[src*=".mp4"]):not(img[src*=".wmv"])',
            /^.*\/cache\/(.*)\/(crop|thumb).*\/(.*)/,
            'https://media.moddb.com/$1/$3',
            'a'
        );

        // poster: https://media.moddb.com/cache/images/games/1/41/40288/crop_120x90/Stewing.mp4.jpg
        // video:  https://cdn.dbolical.com/cache/videos/games/1/41/40288/encode720p_mp4/Stewing.mp4
        hoverZoom.urlReplace(res,
            'img[src*=".mp4"]',
            /^.*\/cache\/images\/(.*)\/(crop|thumb).*\/(.*)\.mp4.*/,
            'https://cdn.dbolical.com/cache/videos/$1/encode_mp4/$3.mp4',
            'a'
        );
        hoverZoom.urlReplace(res,
            'img[src*=".mp4"]',
            /^.*\/cache\/images\/(.*)\/(crop|thumb).*\/(.*)\.mp4.*/,
            'https://cdn.dbolical.com/cache/videos/$1/encode720p_mp4/$3.mp4',
            'a'
        );

        // poster: https://media.moddb.com/cache/images/games/1/1/1/thumb_620x2000/halflife_trailer.mov.jpg
        // video:  https://cdn.dbolical.com/cache/videos/games/1/1/1/encode720p_mp4/halflife_trailer.mov.mp4
        hoverZoom.urlReplace(res,
            'img[src*=".mov"]',
            /^.*\/cache\/images\/(.*)\/(crop|thumb).*\/(.*)\.mov.*/,
            'https://cdn.dbolical.com/cache/videos/$1/encode_mp4/$3.mov.mp4',
            'a'
        );
        hoverZoom.urlReplace(res,
            'img[src*=".mov"]',
            /^.*\/cache\/images\/(.*)\/(crop|thumb).*\/(.*)\.mov.*/,
            'https://cdn.dbolical.com/cache/videos/$1/encode720p_mp4/$3.mov.mp4',
            'a'
        );

        // poster: https://media.moddb.com/cache/images/games/1/1/1/crop_120x90/hl_trail.avi.jpg
        // video:  https://cdn.dbolical.com/cache/videos/games/1/1/1/encode_mp4/hl_trail.avi.mp4
        hoverZoom.urlReplace(res,
            'img[src*=".avi"]',
            /^.*\/cache\/images\/(.*)\/(crop|thumb).*\/(.*)\.avi.*/,
            'https://cdn.dbolical.com/cache/videos/$1/encode_mp4/$3.avi.mp4',
            'a'
        );
        hoverZoom.urlReplace(res,
            'img[src*=".avi"]',
            /^.*\/cache\/images\/(.*)\/(crop|thumb).*\/(.*)\.avi.*/,
            'https://cdn.dbolical.com/cache/videos/$1/encode720p_mp4/$3.avi.mp4',
            'a'
        );

        // poster: https://media.moddb.com/cache/images/games/1/1/76/crop_120x90/Call_of_duty_1_intro_trailer_cod1.flv.jpg
        // video:  https://cdn.dbolical.com/cache/videos/games/1/1/76/encode_mp4/Call_of_duty_1_intro_trailer_cod1.flv.mp4
        hoverZoom.urlReplace(res,
            'img[src*=".flv"]',
            /^.*\/cache\/images\/(.*)\/(crop|thumb).*\/(.*)\.flv.*/,
            'https://cdn.dbolical.com/cache/videos/$1/encode_mp4/$3.flv.mp4',
            'a'
        );
        hoverZoom.urlReplace(res,
            'img[src*=".flv"]',
            /^.*\/cache\/images\/(.*)\/(crop|thumb).*\/(.*)\.flv.*/,
            'https://cdn.dbolical.com/cache/videos/$1/encode720p_mp4/$3.flv.mp4',
            'a'
        );

        // poster: https://media.moddb.com/cache/images/engines/1/2/1010/crop_120x90/Video_2022-08-20_221946.wmv.jpg
        // video:  https://cdn.dbolical.com/cache/videos/engines/1/2/1010/encode720p_mp4/Video_2022-08-20_221946.wmv.mp4
        hoverZoom.urlReplace(res,
            'img[src*=".wmv"]',
            /^.*\/cache\/images\/(.*)\/(crop|thumb).*\/(.*)\.wmv.*/,
            'https://cdn.dbolical.com/cache/videos/$1/encode_mp4/$3.wmv.mp4',
            'a'
        );
        hoverZoom.urlReplace(res,
            'img[src*=".wmv"]',
            /^.*\/cache\/images\/(.*)\/(crop|thumb).*\/(.*)\.wmv.*/,
            'https://cdn.dbolical.com/cache/videos/$1/encode720p_mp4/$3.wmv.mp4',
            'a'
        );

        // audio
        // page with samples: https://www.moddb.com/audio
        // thumbnail: https://www.moddb.com/mods/the-old-realms/videos/vampire-counts-command-lines
        // audio:     https://cdn.dbolical.com/cache/audio/mods/1/47/46579/encode_mp3/DeLaitre_Vampire_Voice_Sample_online-audio-converter.com.mp3
        $('a[href*="/videos/"]:not(.hoverZoomMouseover)').addClass('hoverZoomMouseover').one('mouseover', function() {

            var link = undefined;
            var href = undefined;

            href = this.href;
            link = $(this);

            hoverZoom.prepareFromDocument($(this), this.href, function(doc) {

                let source = doc.querySelector('video source');
                if (source) return source.src;

            }, false); // get source sync
        });

        callback($(res), this.name);
    }
});
