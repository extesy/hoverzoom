var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'tapas.io',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // #region tapas.io hz+ plugin - https://tapas.io/.
        
        /** Info: tapas.io is a webcomic site.
         * They are going to some effort to prevent people from interacting with the images.
         * The image urls don't seem to have any pattern for scaling and contain guids.
         * The "src" appear to use a media server that is not the same as the primary domain.
         * Going to assume it's always a fully qualified URL because it's a different subdomain.
         * Sample URL page: https://tapas.io/episode/1315650
         * Sample Image "src" URL: https://us-a.tapas.io/c/7d/a90127b0-ccb2-422d-b8a5-b05073d0f037.jpg
         */

        // String repository
        const tapasConfig = {
            // Selector assumes src with tapas.io domain and unprocessed.
            discoverySelector: 'img[src*="tapas.io"][class*="content"]:not(.hoverZoomLink)',
            // The class to add to the image so we don't process it again.
            discoveredClass: 'hoverZoomLink',
        };

        // Func: awaitDom: Wait for an element to appear in the DOM.
        // Uses requestAnimationFrame to offset performance issues.
        const awaitDom = async (selector) => {
            while (document.querySelector(selector) === null) {
                await new Promise((resolve) => requestAnimationFrame(resolve));
            }
            return document.querySelectorAll(selector);
        };

        // Func: prepareComics: Prepare the comics for hz+ to discover.
        const prepareComics = (elements) => {
            // Process the (episodes) and push the urls to hz+ res array.
            Array.from(elements).forEach((element) => {
                // Make this element a jQuery object.
                const $image = $(element);
                // Add "src" URL to hz+ to the jQuery dataset as array of URLs.
                $image.data().hoverZoomSrc = [$image.attr('src')];
                // Add the extension class to the image.
                $image.addClass(tapasConfig.discoveredClass);
                // Add the image to the hz+ res array.
                res.push($image);
            });
            // Start another comics listener.
            // On scroll, if more images load, prepareComics is triggered again.
            awaitDom(tapasConfig.discoverySelector).then(prepareComics);
        };

        // Initiate comic listener. If it appears, prepareComics is triggered.
        // The selector assumes src with "tapas.io" domain from config.
        awaitDom(tapasConfig.discoverySelector).then(prepareComics);

        // #endregion

        callback($(res), this.name);
    }
});
