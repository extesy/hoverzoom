var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'eksisozluk',
    version: '1.1',
    prepareImgLinks(callback) {
        const res = [];

        // page hosting link to img: https://eksisozluk.com/entry/140581590
        // link to img:              https://soz.lk/i/3jadcz74
        // fullsize img:             https://cdn.eksisozluk.com/2022/7/28/3/3jadcz74.jpg
        $('a[href*="/soz.lk/"]:not(.hoverZoomLink)').one('mouseover', function () {
            const link = $(this);
            // clean previous result
            link.data().hoverZoomSrc = [];
            // extract date from post and create image link
            const date = link.parent().next().find('.entry-date.permalink')[0].innerText.match(/0?(\d{1,2})\.0?(\d{1,2})\.(\d{1,4})/);
            const src = this.href.replace(/soz\.lk\/i\/(.{1})/, 'cdn.eksisozluk.com/' + date[3] + '/' + date[2] + '/' + date[1] + '/$1/$1');
            link.data('hoverZoomSrc', [src + '.png', src + '.jpg']);

            link.addClass('hoverZoomLink');
        });

        callback($(res), this.name);
    },
});
