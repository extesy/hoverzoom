var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'yupoo',
    version:'0.1',
    prepareImgLinks:function (callback) {
        const pluginName = this.name;
        const res = [];

        // https://x.yupoo.com/

        // load img gallery
        function loadGallery(link, href) {
            chrome.runtime.sendMessage({action:'ajaxGet', url:href}, function (response) {

                if (response == null) { return; }

                const parser = new DOMParser();
                const doc = $(parser.parseFromString(response, "text/html"));

                const imgs = doc.find('div.showalbum__parent div.showalbum__children img[data-origin-src]');
                if (imgs.length == 0) return;

                const gallery = [];
                imgs.each(i => gallery.push([$(imgs[i]).data().originSrc]));

                link.data().hoverZoomGallerySrc = gallery;
                callback(link, pluginName);
                // Gallery is displayed iff cursor is still over the gallery
                if (link.data().hoverZoomMouseOver)
                    hoverZoom.displayPicFromElement(link);
            });
        }

        // albums
        // sample: https://ezfashion.x.yupoo.com/albums/171480497?uid=1&isSubCate=false&referrercate=4654482
        $('a[href*="/albums/"]').one('mouseover', function() {
            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;
            const href = this.href;
            loadGallery(link, href);
        }).one('mouseleave', function() {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // img
        $('div.image__imagewrap').one('mouseover', function() {
            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            const img = link.find('img')[0];
            if (img == undefined) return;
            const fullsizeUrl = img.dataset.originSrc;

            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                link.data().hoverZoomSrc.unshift(fullsizeUrl);
            }

            callback(link, pluginName);
            // Image or video is displayed iff the cursor is still over the link
            if (link.data().hoverZoomMouseOver)
                hoverZoom.displayPicFromElement(link);
        }).one('mouseleave', function() {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        // thumbnail
        // sample: https://photo.yupoo.com/ezfashion/68145e69/square.jpg
        // id:     68145e69
        $('div.viewer__thumbnail').one('mouseover', function() {
            const link = $(this);
            if (link.data().hoverZoomMouseOver) return;
            link.data().hoverZoomMouseOver = true;

            const thumbnail = link.find('img')[0];
            if (thumbnail == undefined) return;
            let m = thumbnail.src.match(/^http.*\/(.*?)\/square\..*$/i);
            if (m == null) return;
            const thumbnailId = m[1];

            // lookup thumbnail id in gallery
            const img = $(window.document.body).find(`div.showalbum__parent div.showalbum__children img[data-origin-src*=${thumbnailId}]`)[0];
            if (img == undefined) return;
            const fullsizeUrl = img.dataset.originSrc;

            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                link.data().hoverZoomSrc.unshift(fullsizeUrl);
            }

            callback(link, pluginName);
            // Image or video is displayed iff the cursor is still over the link
            if (link.data().hoverZoomMouseOver)
                hoverZoom.displayPicFromElement(link);
        }).one('mouseleave', function() {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        callback($(res), this.name);
    }
});
