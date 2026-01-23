var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'sankaku',
    version:'0.1',
    prepareImgLinks:function (callback) {
        const pluginName = this.name;
        var res = [];

        // https://sankaku.app/

        // posts
        // sample: https://sankaku.app/fr/posts/YoMBDY4dBrO?tags=hide_posts_in_books%3Aalways%20order%3Aquality%20Misaki_Kurehito&tab=explore
        $('a[href*="/posts/"]').one('mouseover', function() {
            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            const re = /.*\/posts\/([^\?\/]{1,})/
            const m = this.href.match(re);
            if (!m) return;
            const id = m[1];

            const apiCall = `https://sankakuapi.com/posts/${id}/fu`;

            const accessToken = hoverZoom.getCookie("accessToken").replace(/"/g, '');

            chrome.runtime.sendMessage({action:'ajaxGet',
                                        url:apiCall,
                                        headers:[{"header":"authorization", "value":"Bearer " + accessToken}]}, function (response) {

                if (response == null) { return; }
                try {
                    const j = JSON.parse(response);

                    link.data().hoverZoomSrc = [j?.data?.file_url || j?.data?.fallback_url];

                    res = [link];
                    callback($(res), pluginName);
                    // Image is displayed iff cursor is still over the image
                    if (link.data().hoverZoomMouseOver)
                        hoverZoom.displayPicFromElement(link);
                } catch {
                    return;
                }
            });

        }).one('mouseleave', function() {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // users
        // sample: https://sankaku.app/users/Domestikun
        $('a[href*="/users/"]').one('mouseover', function() {
            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            const re = /.*\/users\/([^\?\/]{1,})/
            const m = this.href.match(re);
            if (!m) return;
            const id = m[1];

            const apiCall = `https://sankakuapi.com/users/name/${id}`;

            const accessToken = hoverZoom.getCookie("accessToken").replace(/"/g, '');

            chrome.runtime.sendMessage({action:'ajaxGet',
                                        url:apiCall,
                                        headers:[{"header":"authorization", "value":"Bearer " + accessToken}]}, function (response) {

                if (response == null) { return; }
                try {
                    const j = JSON.parse(response);
                    if (!j.avatar_url) return; // no avatar picture
                    link.data().hoverZoomSrc = [j.avatar_url];
                    link.data().hoverZoomCaption = [`${j.display_name} - ${j.name}`];

                    res = [link];
                    callback($(res), pluginName);
                    // Image is displayed iff cursor is still over the image
                    if (link.data().hoverZoomMouseOver)
                        hoverZoom.displayPicFromElement(link);
                } catch {
                    return;
                }
            });

        }).one('mouseleave', function() {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // companions
        // sample: https://sankaku.app/fr/companions/3y0abW9br2o/Sonia
        $('a[href*="/companions/"]').one('mouseover', function() {
            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            const re = /.*\/companions\/([^\?\/]{1,})/
            const m = this.href.match(re);
            if (!m) return;
            const id = m[1];

            const apiCall = `https://sankakuapi.com/companions/${id}`;

            const accessToken = hoverZoom.getCookie("accessToken").replace(/"/g, '');

            chrome.runtime.sendMessage({action:'ajaxGet',
                                        url:apiCall,
                                        headers:[{"header":"authorization", "value":"Bearer " + accessToken}]}, function (response) {

                if (response == null) { return; }
                try {
                    const j = JSON.parse(response);
                    link.data().hoverZoomSrc = [j?.file_url || j?.avatar_url];
                    link.data().hoverZoomCaption = [`${j.name} - ${j.gender}`];

                    res = [link];
                    callback($(res), pluginName);
                    // Image is displayed iff cursor is still over the image
                    if (link.data().hoverZoomMouseOver)
                        hoverZoom.displayPicFromElement(link);
                } catch {
                    return;
                }
            });

        }).one('mouseleave', function() {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // books
        // sample: https://sankaku.app/fr/books/xkrXGALzaeK
        $('a[href*="/books/"]').one('mouseover', function() {
            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            const re = /.*\/books\/([^\?\/]{1,})/
            const m = this.href.match(re);
            if (!m) return;
            const id = m[1];

            const apiCall = `https://sankakuapi.com/pools/${id}`;

            const accessToken = hoverZoom.getCookie("accessToken").replace(/"/g, '');

            chrome.runtime.sendMessage({action:'ajaxGet',
                                        url:apiCall,
                                        headers:[{"header":"authorization", "value":"Bearer " + accessToken}]}, function (response) {

                if (response == null) { return; }
                try {
                    const j = JSON.parse(response);

                    let gallery = [];
                    let captions = [];

                    j?.posts.map(p => { gallery.push([p?.file_url || p?.sample_url || p?.preview_url]); captions.push(j?.name || j?.name_en || j?.name_ja); });
                    link.data().hoverZoomGallerySrc = gallery;
                    link.data().hoverZoomGalleryCaption = captions;

                    res = [link];
                    callback($(res), pluginName);
                    // Image is displayed iff cursor is still over the image
                    if (link.data().hoverZoomMouseOver)
                        hoverZoom.displayPicFromElement(link);
                } catch {
                    return;
                }
            });

        }).one('mouseleave', function() {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // collections
        // sample: https://sankaku.app/fr/collections/y6ea46WoR3v
         $('a[href*="/collections/"]').one('mouseover', function() {
            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            const re = /.*\/collections\/([^\?\/]{1,})/
            const m = this.href.match(re);
            if (!m) return;
            const id = m[1];

            const apiCall = `https://sankakuapi.com/collections/${id}`;

            const accessToken = hoverZoom.getCookie("accessToken").replace(/"/g, '');

            chrome.runtime.sendMessage({action:'ajaxGet',
                                        url:apiCall,
                                        headers:[{"header":"authorization", "value":"Bearer " + accessToken}]}, function (response) {

                if (response == null) { return; }
                try {
                    const j = JSON.parse(response);

                    let gallery = [];
                    let captions = [];

                    j?.previews.map(p => { gallery.push([...new Set([p?.file_url, p?.sample_url, p?.preview_url])]); captions.push(`${j?.name} - ${j?.description}`); });
                    link.data().hoverZoomGallerySrc = gallery;
                    link.data().hoverZoomGalleryCaption = captions;

                    res = [link];
                    callback($(res), pluginName);
                    // Image is displayed iff cursor is still over the image
                    if (link.data().hoverZoomMouseOver)
                        hoverZoom.displayPicFromElement(link);
                } catch {
                    return;
                }
            });

        }).one('mouseleave', function() {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        callback($(res), pluginName);
    }
});
