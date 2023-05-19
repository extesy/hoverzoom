var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'iwara',
    version: '1.0',
    prepareImgLinks: function(callback) {

        const pluginName = this.name;
        var res = [];

        // avatars
        // sample:   https://i.iwara.tv/image/avatar/0dbd4240-46eb-49e9-a79c-26c4488b5232/0dbd4240-46eb-49e9-a79c-26c4488b5232.jpg
        // fullsize: https://i.iwara.tv/image/original/0dbd4240-46eb-49e9-a79c-26c4488b5232/0dbd4240-46eb-49e9-a79c-26c4488b5232.jpg
        $('a[href*="/profile/"] img:not(.hoverZoomMouseover)').addClass('hoverZoomMouseover').one('mouseover', function() {
            const img = this;
            const link = $(this).parents('a');
            const src = img.src.replace('/avatar/', '/original/');
            link.data().hoverZoomSrc = [src];
            callback(link, name);
            hoverZoom.displayPicFromElement(link);
        });

        // images
        $('a[href*="/image/"]:not(.hoverZoomMouseover)').addClass('hoverZoomMouseover').one('mouseover', function() {
            const link = $(this);
            var matches = this.href.match(/\/image\/([^\/]{1,})/); // e.g: https://www.iwara.tv/image/gkmh4fTHStc0Tq/vr-with-koikatsu-for-you-2 => id = gkmh4fTHStc0Tq
            if (!matches) return;
            const id = matches[1];
            chrome.runtime.sendMessage({action:'ajaxRequest',
                                        method:'GET',
                                        url:'https://api.iwara.tv/image/' + id},
                                        function (response) {
                                            if (response) {
                                                try {
                                                    let j = JSON.parse(response);
                                                    const files = j.files;
                                                    if (files && files.length) {
                                                        var gallery = [];
                                                        files.forEach(i => gallery.push(['https://i.iwara.tv/image/original/' + i.id + '/' + i.name]));  // e.g: https://i.iwara.tv/image/original/475de3a5-0189-43b8-939e-d05aeeb93421/hairy_1.jpg
                                                        link.data().hoverZoomSrc = undefined;
                                                        link.data().hoverZoomGallerySrc = gallery;
                                                        link.data().hoverZoomGalleryIndex = 0;
                                                        callback(link, pluginName);
                                                        hoverZoom.displayPicFromElement(link);
                                                    }
                                                } catch {}
                                            }
                                        });
        });

        callback($(res), pluginName);
    }
});
