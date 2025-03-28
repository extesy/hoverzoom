var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'VK.com',
    version:'1.5',
    prepareImgLinks:function (callback) {
        const res = [];

        $('img[src*=".userapi.com/s/"], div[style*=".userapi.com/s/"]').one('mouseenter', function () {
            let link = $(this), url = this.getAttribute('src');
            if (!url) {
                url = this.style.backgroundImage;
                url = url.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
            }
            // example url: https://sun6-21.userapi.com/s/v1/ig2/g7tzQqEL8XklUJn372fl13rbTyD4wdh8d5pfQbdErfWrUZEM3L7KF3xzBCbb8QouT2VlAKHy0M7USE242_W6jXmg.jpg?quality=95&crop=213,45,716,716&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640&ava=1&u=t53O3an8Miwp5cxILV0zmDbhSSSzB5h8y-qrEvpnvPA&cs=400x400
            // desired url: https://sun6-21.userapi.com/s/v1/ig2/g7tzQqEL8XklUJn372fl13rbTyD4wdh8d5pfQbdErfWrUZEM3L7KF3xzBCbb8QouT2VlAKHy0M7USE242_W6jXmg.jpg?quality=95&crop=213,45,716,716&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640&ava=1&u=t53O3an8Miwp5cxILV0zmDbhSSSzB5h8y-qrEvpnvPA&cs=640x640
            const asMatch = url.match(/as=([^&]+)/);
            if (!asMatch) return;
            const sizes = asMatch[1].split(',');
            const lastSize = sizes[sizes.length - 1];
            url = url.replace(/cs=[^&]+/, 'cs=' + lastSize);
            link.data().hoverZoomSrc = [url];
            link.addClass('hoverZoomLink');
            hoverZoom.displayPicFromElement(link);
        });

        callback($(res), this.name);
    }
});
