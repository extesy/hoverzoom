var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'sankaku',
    version:'0.1',
    prepareImgLinks:function (callback) {
        const pluginName = this.name;
        var res = [];

        // https://sankaku.app/

        function handleSankakuLink(linkType, apiPathGenerator, dataProcessor) {
            $(`a[href*="/${linkType}/"]`).one('mouseover', function() {
                const link = $(this);
                if (link.data().hoverZoomMouseOver) return;
                link.data().hoverZoomMouseOver = true;

                const re = new RegExp(`.*\/${linkType}\/([^\?\/]{1,})`);
                const m = this.href.match(re);
                if (!m) return;
                const id = m[1];

                const apiCall = apiPathGenerator(id);
                const accessToken = hoverZoom.getCookie("accessToken").replace(/"/g, '');

                chrome.runtime.sendMessage({
                    action: 'ajaxGet',
                    url: apiCall,
                    headers: [{"header": "authorization", "value": "Bearer " + accessToken}]
                }, function(response) {
                    if (response == null) { return; }
                    try {
                        const j = JSON.parse(response);
                        dataProcessor(link, j);
                        res.push(link);
                        callback($(res), pluginName);
                        if (link.data().hoverZoomMouseOver)
                            hoverZoom.displayPicFromElement(link);
                    } catch (error) {
                        cLog(`Error processing Sankaku ${linkType} link: ${error}`);
                        return;
                    }
                });

            }).one('mouseleave', function() {
                const link = $(this);
                link.data().hoverZoomMouseOver = false;
            });
        }

        // posts
        // sample: https://sankaku.app/fr/posts/YoMBDY4dBrO?tags=hide_posts_in_books%3Aalways%20order%3Aquality%20Misaki_Kurehito&tab=explore
        handleSankakuLink('posts', id => `https://sankakuapi.com/posts/${id}/fu`, (link, j) => {
            link.data().hoverZoomSrc = [j?.data?.file_url || j?.data?.fallback_url];
        });

        // users
        // sample: https://sankaku.app/users/Domestikun
        handleSankakuLink('users', id => `https://sankakuapi.com/users/name/${id}`, (link, j) => {
            if (!j.avatar_url) return; // no avatar picture
            link.data().hoverZoomSrc = [j.avatar_url];
            link.data().hoverZoomCaption = [`${j.display_name} - ${j.name}`];
        });

        // companions
        // sample: https://sankaku.app/fr/companions/3y0abW9br2o/Sonia
        handleSankakuLink('companions', id => `https://sankakuapi.com/companions/${id}`, (link, j) => {
            link.data().hoverZoomSrc = [j?.file_url || j?.avatar_url];
            link.data().hoverZoomCaption = [`${j.name} - ${j.gender}`];
        });

        // books
        // sample: https://sankaku.app/fr/books/xkrXGALzaeK
        handleSankakuLink('books', id => `https://sankakuapi.com/pools/${id}`, (link, j) => {
            let gallery = [];
            let captions = [];
            j?.posts.map(p => { gallery.push([p?.file_url || p?.sample_url || p?.preview_url]); captions.push(j?.name || j?.name_en || j?.name_ja); });
            link.data().hoverZoomGallerySrc = gallery;
            link.data().hoverZoomGalleryCaption = captions;
        });

        // collections
        // sample: https://sankaku.app/fr/collections/y6ea46WoR3v
        handleSankakuLink('collections', id => `https://sankakuapi.com/collections/${id}`, (link, j) => {
            let gallery = [];
            let captions = [];
            j?.previews.map(p => { gallery.push([...new Set([p?.file_url, p?.sample_url, p?.preview_url])]); captions.push(`${j?.name} - ${j?.description}`); });
            link.data().hoverZoomGallerySrc = gallery;
            link.data().hoverZoomGalleryCaption = captions;
        });

        callback($(res), pluginName);
    }
});
