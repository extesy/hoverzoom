var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'woot.com',
    version: '0.1',
    prepareImgLinks(callback) {
        const res = [];
        const thumbnailRegex = /\._.*_\./;

        // All images are thumbnails: https://shirt.woot.com/plus/derby-editors-choice-sportsball-1?ref=w_cnt_wp_1
        // Some images are not thumbnails, but full size: https://www.woot.com/category/computers/desktops?ref=w_cnt_cdet_pc_2
        $('ul a img').each(function handleNestedImages() {
            const { src } = this;
            const link = $(this);
            const fullsize = src.replace(thumbnailRegex, '.');

            link.data().hoverZoomSrc = [fullsize];
            link.addClass('hoverZoomLink');
            res.push(link);
        });

        // Div overlay: https://www.woot.com/alldeals?ref=w_ngh_et_1
        $('a div img').each(function handleDivOverlay() {
            const { src } = this;
            const link = $(this);
            const fullsize = src.replace(thumbnailRegex, '.');

            const divOverlay = link.parent().next('div');
            if (divOverlay[0]) {
                divOverlay.data().hoverZoomSrc = [fullsize];
                divOverlay.addClass('hoverZoomLink');
                res.push(divOverlay);
            }
        });

        callback($(res), this.name);
    },
});
