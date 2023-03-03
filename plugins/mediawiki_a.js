var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'MediaWiki_a',
    version:'1.0',
    favicon:'mediawiki.svg',
    prepareImgLinks:function (callback) {

        var res = [];

        // thumbnail: https://runescape.wiki/images/thumb/2/26/Senntisten_Kree%27arra_vs_Nodon.png/534px-Senntisten_Kree%27arra_vs_Nodon.png?de6e2
        //  fullsize: https://runescape.wiki/images/2/26/Senntisten_Kree%27arra_vs_Nodon.png
        $('img[src*="wiki"][src*="thumb/"], image[href*="wiki"]').each(function() {
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

            src = src.replace(/([^\?]{1,}).*/, '$1');

            if (src.substr(src.length - 8) == '.svg.png') {
                ext = '.svg';
            } else {
                ext = src.substr(src.lastIndexOf('.'));
            }

            if (src.indexOf(ext + '/') == -1) return;

            srcs.push(src.substring(0, src.indexOf(ext) + ext.length).replace('thumb/', ''));
            _this.data().hoverZoomSrc = srcs;
            res.push(_this);

        });

        // sample: https://commons.wikimedia.org/wiki/File:Mary_Stuart_Young6.jpg
        $('a[href*="/wiki/File:"]').one('mouseenter', function() {
            hoverZoom.prepareFromDocument($(this), this.href, function (doc) {
                let link = $(this);
                var ogImg = doc.head.querySelector('meta[property="og:image"]');
                if (ogImg) {
                    return ogImg.content;
                }
            });
        });

        callback($(res), this.name);
    }
});
