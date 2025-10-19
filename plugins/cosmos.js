var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'cosmos',
    version:'0.1',
    prepareImgLinks:function (callback) {
        const pluginName = this.name;
        var res = [];

        // https://www.cosmos.so

        var aMouseMoveDelay = 100, aMouseMoveTimeout;

        function aMouseMoveAsync(event) {
            clearTimeout(aMouseMoveTimeout);
            const currentTarget = event.currentTarget;
            aMouseMoveTimeout = setTimeout(function() { aMouseMove(event, $(currentTarget)) }, aMouseMoveDelay);
        }

        function aMouseMove(e, link) {
            clearTimeout(aMouseMoveTimeout);
            // check if mouse is above an image
            let img = findImgBelow(e, e.target);
            if (img === undefined) {
                img = findImgBelow(e, e.target.offsetParent);
            }

            if (img) {
                const src = img[0].src.replace(/\?.*$/, '?format=png');
                link.data().hoverZoomSrc = [src];
                // Picture is displayed iff cursor is still over the picture
                if (link.data().hoverZoomMouseOver)
                    hoverZoom.displayPicFromElement(link);
            }
        }

        // find image below mouse pointer and return it
        // if no image found then return undefined
        function findImgBelow(e, target) {
            let img;
            const imgs = $(target).find('img');
            if (imgs.length > 0) {
                let x = e.pageX;
                let y = e.pageY;
                if (x && y) {
                    imgs.each(function() {
                        if(x < $(this).offset().left) return true;
                        if(x > $(this).offset().left + $(this).width()) return true;
                        if(y < $(this).offset().top) return true;
                        if(y > $(this).offset().top + $(this).height()) return true;

                        img = $(this);
                        return false;
                    });
                }
            }
            return img;
        }

        // main profile picture
        $('button:not([data-element-id])').one('mouseover', function() {
            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            const img = link.find('img')[0];
            if (img) {
                const src = img.src.replace(/\?.*$/, '?format=png');
                link.data().hoverZoomSrc = [src];
                res = [link];
                callback($(res), pluginName);
            }

        }).one('mouseleave', function() {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // elements
        $('button[data-element-id]').one('mouseover', function() {
            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            const elementId = link.data().elementId;
            const href = `https://www.cosmos.so/e/${elementId}`;

            chrome.runtime.sendMessage({action:'ajaxGet', url:href}, function (response) {

                if (response == null) { return; }

                const parser = new DOMParser();
                const doc = parser.parseFromString(response, "text/html");
                if (doc.scripts == undefined) return;
                let scripts = Array.from(doc.scripts);
                scripts = scripts.filter(script => script.id === "__NEXT_DATA__");
                if (scripts.length != 1) return;
                const scriptText = scripts[0].text;
                const apollo = JSON.parse(scriptText).props.pageProps.initialApolloState;
                const hit = hoverZoom.getKeysInJsonObject(apollo, 'ElementInterface:\\d+', true)[0];
                if (hit === undefined) return;
                const ei = hit.value;

                const caption = `${ei?.userName || ''} ${ei.authorName || ''} ${ei.generatedCaption?.text.replace(/<\/?n>/g, '') || ''}`.trim();
                // check if there is a carousel to fill gallery with
                if (ei.isCarousel === true) {

                    const gallery = [];
                    ei.media.map(i => gallery.push([i?.video?.url || i.image.url]));
                    const captions = [];
                    if (caption) ei.media.map(i => captions.push([caption]));

                    link.data().hoverZoomGallerySrc = gallery;
                    if (caption) link.data().hoverZoomGalleryCaption = captions;

                } else if (ei.video) {

                    link.data().hoverZoomSrc = [ei.video.url];
                    if (caption) link.data().hoverZoomCaption = [caption];

                } else if (ei.image) {

                    link.data().hoverZoomSrc = [ei.image.mp4Url || ei.image.url];
                    if (caption) link.data().hoverZoomCaption = [caption];

                } else return;

                res = [link];
                callback($(res), pluginName);
                // Picture is displayed iff cursor is still over the picture
                if (link.data().hoverZoomMouseOver)
                    hoverZoom.displayPicFromElement(link);

            });

        }).one('mouseleave', function() {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // link with one or more images below
        $('a[href]').on('mouseover', function() {
            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;
            this.addEventListener('mousemove', aMouseMoveAsync);
        }).on('mouseleave', function() {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
            this.removeEventListener('mousemove', aMouseMoveAsync);
        });

        callback($(res), pluginName);
    }
});
