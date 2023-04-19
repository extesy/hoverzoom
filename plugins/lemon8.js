var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'lemon8',
    version: '1.0',
    prepareImgLinks: function(callback) {
        const pluginName = this.name;
        var res = [];

        // Hook Lemon8 'Fetch' XMLHttpRequests to catch data & metadata associated with images & videos
        // Catched data is stored in sessionStorage for later use by plug-in

        if ($('script.HZLemon8Fetch').length == 0) { // Inject hook script in document if not already there
            var fetchScript = document.createElement('script');
            fetchScript.type = 'text/javascript';
            fetchScript.text = `
                const {fetch: origFetch} = window;
                window.fetch = async (...args) => {
                    const response = await origFetch(...args);
                    // work with the cloned response in a separate promise chain -- could use the same chain with await.
                    response
                        .clone()
                        .json()
                        .then(body => {
                            var HZLemon8FetchData = sessionStorage.getItem('HZLemon8FetchData') || '[]';
                            HZLemon8FetchData = JSON.parse(HZLemon8FetchData);
                            HZLemon8FetchData.push(body);
                            //const j = JSON.parse(body);
                            //HZLemon8FetchData.push(j);
                            // update sessionStorage, if no more room then reset
                            try {
                                sessionStorage.setItem('HZLemon8FetchData', JSON.stringify(HZLemon8FetchData));
                            } catch {
                                // reset sessionStorage
                                HZLemon8FetchData = [];
                                HZLemon8FetchData.push(j);
                                sessionStorage.setItem('HZLemon8FetchData', JSON.stringify(HZLemon8FetchData));
                            }
                        })
                        .catch()
                    ;
                    // the original response can be resolved unmodified:
                    return response;
                }
            `;
            fetchScript.classList.add('HZLemon8Fetch');
            (document.head || document.documentElement).appendChild(fetchScript);
        };

        // avatars
        // sample:   https://p16.topbuzzcdn.com/img/user-avatar-alisg/57aecf356dc08cbc34413ecf9684b4ab~1200x0.image
        // fullsize: https://p16.topbuzzcdn.com/img/user-avatar-alisg/57aecf356dc08cbc34413ecf9684b4ab~0x0.jpg
        // sample:   https://p16-lemon8-sign-va.ibyteimg.com/user-avatar-musically/8d64fe5ad0e832997070301c904732b0~tplv-tej9nj120t-shrink:120:0:q75.webp?source=feed_user&x-expires=1682899200&x-signature=OSw%2F%2FQ1Uu67oHoiK0Broe%2FjlXFs%3D
        // fullsize: https://p16-va.topbuzzcdn.com/img/user-avatar-musically/8d64fe5ad0e832997070301c904732b0~0x0.jpg
        hoverZoom.urlReplace(res,
            'img[src*="user-avatar"]',
            /^.*\/(.*?)\/(.*)~.*$/,
            'https://p16-va.topbuzzcdn.com/img/$1/$2~0x0.jpg',
            'a'
        );

        // photos & videos with id
        $('a[href]:not(.hoverZoomMouseover)').filter(function() { return (/lemon8-app/.test($(this).prop('href'))) }).filter(function() { return (/\/\d+/.test($(this).prop('href'))) }).addClass('hoverZoomMouseover').one('mouseover', function() {

            var link = this;
            link = $(link);

            // sample: https://www.lemon8-app.com/hannahcrews/7216515352409358853?region=us
            //  => id: 7216515352409358853
            const re = /\/(\d+)/;
            const m = link.attr('href').match(re);
            if (m == null) return;
            const id = m[1];

            const fetchedData = sessionStorage.getItem('HZLemon8FetchData');
            let index = fetchedData?.indexOf(id);
            if (index && index !== -1) {
                const j = JSON.parse(fetchedData);
                j.forEach(function(jj) {

                    // search id
                    const values = hoverZoom.getValuesInJsonObject(jj, id, false, false, true); // look for a full match
                    if (values.length == 0) return;

                    // build path to parent object
                    const path = values[0].path.replace('["group_id"]', '').replace('["item_id"]', '');
                    // images
                    const images = hoverZoom.getJsonObjectFromPath(jj, path).image_list;
                    if (images && images.length) {
                        const gallery = images.map(i => { if (i.url_list) return [i.url_list[0].url]; return [i.seo_url]; });
                        link.data().hoverZoomSrc = undefined;
                        link.data().hoverZoomGallerySrc = gallery;
                        link.data().hoverZoomGalleryIndex = 0;
                        callback(link, pluginName);
                        hoverZoom.displayPicFromElement(link);
                    } else {
                        // video
                        const video = hoverZoom.getJsonObjectFromPath(jj, path).video;
                        if (video) {
                            const gallery = video.url_list.map(i => [i.urls[0] + '.video']);
                            link.data().hoverZoomSrc = undefined;
                            link.data().hoverZoomGallerySrc = gallery;
                            link.data().hoverZoomGalleryIndex = 0;
                            callback(link, pluginName);
                            hoverZoom.displayPicFromElement(link);
                        }
                    }
                });
            }

            if (link.data().hoverZoomGallerySrc == undefined) {
                // load link
                hoverZoom.prepareFromDocument(link, this.href, function (doc, callback) {
                    // video
                    const video = doc.body.querySelector('video source');
                    if (video) {
                        callback(video.src + '.video');
                        hoverZoom.displayPicFromElement(link);
                    } else {
                        // images
                        const images = doc.body.querySelectorAll('ul.sharee-carousel-list-inner img');
                        if (images && images.length) {
                            var gallery = [];
                            images.forEach(i => gallery.unshift([i.src]));
                            link.data().hoverZoomSrc = undefined;
                            link.data().hoverZoomGallerySrc = gallery;
                            link.data().hoverZoomGalleryIndex = 0;
                            callback(gallery);
                            hoverZoom.displayPicFromElement(link);
                        }
                    }

                }, true); // get source async
            }
        });

        // photos & videos without id
        $('a[href]:not(.hoverZoomMouseover)').filter(function() { return (/lemon8-app/.test($(this).prop('href'))) }).filter(function() { return (!/\/\d+/.test($(this).prop('href'))) }).addClass('hoverZoomMouseover').one('mouseover', function() {

            var link = this;
            link = $(link);
            if (link.data().hoverZoomSrc) return;

            // load link
            hoverZoom.prepareFromDocument(link, this.href, function (doc, callback) {
                const token = "window.__INITIAL_STATE__=";
                const scripts = doc.querySelectorAll('script');
                const script = Array.from(scripts).filter(s => s.text.indexOf(token) === 0);
                if (script.length !== 1) return;

                try {
                    const j = JSON.parse(script[0].text.replace(token, '').replaceAll(':undefined,', ':"undefined",'));
                    // video
                    const video = j.article.video;
                    if (video) {
                        const gallery = video.url_list.map(i => [i.urls[0] + '.video']);
                        link.data().hoverZoomSrc = undefined;
                        link.data().hoverZoomGallerySrc = gallery;
                        link.data().hoverZoomGalleryIndex = 0;
                        callback(gallery);
                        hoverZoom.displayPicFromElement(link);
                    } else {
                        // images
                        const images = j.article.image_list;
                        if (images && images.length) {
                            const gallery = images.map(i => { if (i.url_list) return [i.url_list[0].url]; return [i.seo_url]; });
                            link.data().hoverZoomSrc = undefined;
                            link.data().hoverZoomGallerySrc = gallery;
                            link.data().hoverZoomGalleryIndex = 0;
                            callback(gallery);
                            hoverZoom.displayPicFromElement(link);
                        }
                    }
                } catch {}
            }, true); // get source async
        });

        callback($(res), pluginName);
    }
});
