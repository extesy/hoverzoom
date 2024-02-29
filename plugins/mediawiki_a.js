var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'MediaWiki_a',
    version:'1.2',
    favicon:'mediawiki.svg',
    prepareImgLinks:function (callback) {
        var res = [];

        // thumbnail: /images/thumb/2/26/Senntisten_Kree%27arra_vs_Nodon.png/534px-Senntisten_Kree%27arra_vs_Nodon.png?de6e2
        //  fullsize: https://runescape.wiki/images/2/26/Senntisten_Kree%27arra_vs_Nodon.png
        $('.mediawiki img[src*="thumb/"], image[href*="wiki"]').each(function() {
            let _this = $(this);
            let src = '';
            let srcs = [];
            let ext = '';

            if (this.src) {
                src = this.src;
            } else {
                if (!this.href) return;
                if (!this.href.baseVal) return;
                src = this.href.baseVal;
            }

            src = src.replace(/([^?]+).*/, '$1');

            if (src.substr(src.length - 8) === '.svg.png') {
                ext = '.svg';
            } else {
                ext = src.substr(src.lastIndexOf('.'));
            }

            if (src.indexOf(ext + '/') === -1) return;

            srcs.push(src.substring(0, src.indexOf(ext) + ext.length).replace('thumb/', ''));
            _this.data().hoverZoomSrc = srcs;
            res.push(_this);
        });

        // sample (image): https://commons.wikimedia.org/wiki/File:Mary_Stuart_Young6.jpg
        // sample (audio): https://en.wiktionary.org/wiki/File:En-au-face-melter.ogg
        // sample (video): https://en.wikipedia.org/wiki/File:Rocky_(1976)_-_Rocky_Steps.ogv
        //                 https://de.wiktionary.org/wiki/Datei:Bublak_mofette.ogv
        $('a[href*="/wiki/"]').filter(function() { return (/\/wiki\/\w+:/.test($(this).prop('href'))) }).one('mouseenter', function() {
            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            if (link.data().hoverZoomSrc === undefined) {
                // load link
                hoverZoom.prepareFromDocument(link, this.href, function (doc, callback) {
                    // check if the target link redirects to the same document
                    const current = document.head.querySelector('link[rel="canonical"]').href;
                    const canonical = doc.head.querySelector('link[rel="canonical"]').href;
                    if (canonical === current)
                        return
                    // default media
                    var ogImg = doc.head.querySelector('meta[property="og:image"]');
                    // full media
                    var media = doc.querySelectorAll('.fullMedia');
                    if (media.length === 1) {
                        media = $(media[0]);
                        media = media.find('a[href]')[0];
                        if (media) {
                            callback(media.href);
                            // Image or video is displayed iff the cursor is still over the link
                            if (link.data().hoverZoomMouseOver)
                                hoverZoom.displayPicFromElement(link);
                        }
                    } else if (ogImg) {
                        callback(ogImg.content);
                        // Image or video is displayed iff the cursor is still over the link
                        if (link.data().hoverZoomMouseOver)
                            hoverZoom.displayPicFromElement(link);
                    }
                }, true); // get source async
            }
        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        callback($(res), this.name);
    }
});
