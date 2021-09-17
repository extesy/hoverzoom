var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'MediaWiki_a',
    version:'0.8',
    prepareImgLinks:function (callback) {

        var res = [];

        // thumbnail: https://runescape.wiki/images/thumb/2/26/Senntisten_Kree%27arra_vs_Nodon.png/534px-Senntisten_Kree%27arra_vs_Nodon.png?de6e2
        //  fullsize: https://runescape.wiki/images/2/26/Senntisten_Kree%27arra_vs_Nodon.png
        $('img[src*="/images/thumb/"], image').each(function() {
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

        callback($(res), this.name);
    }
});
