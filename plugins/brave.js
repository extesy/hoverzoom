var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'brave',
    version: '1.1',
    prepareImgLinks: function(callback) {
        const res = [];

        // Brave image proxy URLs embed the original image URL in base64 after /g:ce/
        // Base64 'http' begins with 'aHR0' and path chunks may be separated by slashes.
        function decodeUrl(url) {
            const match = url.match(/\/(aHR0[a-zA-Z0-9_\-\/]+)/);
            if (!match) return null;

            let b64 = match[1].replace(/\//g, '');
            b64 = b64.replace(/-/g, '+').replace(/_/g, '/');
            b64 = b64.padEnd(Math.ceil(b64.length / 4) * 4, '=');
            try {
                const bin = atob(b64);
                try {
                    return decodeURIComponent(escape(bin));
                } catch {
                    return bin;
                }
            } catch {
                return null;
            }
        }

        const selector = 'img[src*="imgs.search.brave.com"]';
        $(selector).filter(':not(.hoverZoomLink)').each(function() {
            const fullUrl = decodeUrl(this.src);
            if (!fullUrl || fullUrl.includes('favicons.search.brave.com')) return;

            const img = $(this);
            img.data().hoverZoomSrc = [fullUrl];
            if (this.alt) img.data().hoverZoomCaption = this.alt;
            res.push(img);
        });

        callback($(res), this.name);
    }
});
