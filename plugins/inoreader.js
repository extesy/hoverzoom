var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'inoreader',
    version: '1.0',
    prepareImgLinks: function(callback) {
        var name = this.name;

        // https://www.inoreader.com/dashboard
        // sample: https://www.inoreader.com/camo/s7o8TiOXaJo78fmgTm76oOBCXFpqJfcRaLbYizUdgxio,q80,x120,b64/aHR0cHM6Ly93d3cuc21iYy1jb21pY3MuY29tL2NvbWljcy8xNzE0MzQ0NzYxLTIwMjQwNDI4LnBuZw
        //      -> https://www.inoreader.com/camo/s7o8TiOXaJo78fmgTm76oOBCXFpqJfcRaLbYizUdgxio,q100,x9999,b64/aHR0cHM6Ly93d3cuc21iYy1jb21pY3MuY29tL2NvbWljcy8xNzE0MzQ0NzYxLTIwMjQwNDI4LnBuZw

        const filter = /\.inoreader\.com\//;
        const regex = /(.*),q\d+,x\d+,(b\d+.*)/;
        const patch = '$1,q100,x9999,$2';
        const regexOther = /(.*)?\?.*/;
        const patchOther = '$1';

        $('div[style*=url], img[src]').one('mouseover', function() {
            const link = $(this);
            let data = link.data();

            if (data.hoverZoomMouseOver) return;
            data.hoverZoomMouseOver = true;

            var imgUrl = undefined;
            if (link[0].src) {
                imgUrl = link[0].src;
            } else {
                // extract url from style
                var backgroundImage = link[0].style.backgroundImage;
                const reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
                backgroundImage = backgroundImage.replace(reUrl, '$1');
                // remove leading & trailing quotes
                imgUrl = backgroundImage.replace(/^['"]/, "").replace(/['"]+$/, "");
            }

            if (filter.test(imgUrl)) {
                imgUrl = imgUrl.replace(regex, patch);
                data.hoverZoomSrc = [imgUrl];
            } else {
                let imgUrlOrig = imgUrl;
                imgUrl = imgUrl.replace(regexOther, patchOther);
                data.hoverZoomSrc = imgUrl == imgUrlOrig ? [imgUrl] : [imgUrl,imgUrlOrig];
            }

            callback(link, name);

            // Image or video is displayed iff the cursor is still over the link
            if (link.data().hoverZoomMouseOver)
                hoverZoom.displayPicFromElement(link, true);

        }).one('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

    }
});
