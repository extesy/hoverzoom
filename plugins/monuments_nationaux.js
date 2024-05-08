var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'monuments_nationaux',
    version:'0.1',
    prepareImgLinks:function (callback) {
        const name = this.name;
        var res = [];

        // sample: https://www.monuments-nationaux.fr/var/cmn_inter/storage/images/_aliases/news_card_webp/4/1/6/4/121534614-1-fre-FR/dcfb1f32662c-Affiche-Officielle-Paralympique.webp.webp
        //      -> https://www.monuments-nationaux.fr/var/cmn_inter/storage/images/4/1/6/4/121534614-1-fre-FR/dcfb1f32662c-Affiche-Officielle-Paralympique.jpg
        const reFind = /(.*?\/images)\/.*?\/.*?\/(.*)\.webp\.webp/;
        const reReplace = '$1/$2.jpg';

        // sample: https://cmn-media.easycreadoc.com/uploads/library/662/0db/7c8/9a8/6620db7c89a89-400x400.png
        //      -> https://cmn-media.easycreadoc.com/uploads/library/662/0db/7c8/9a8/6620db7c89a89
        const reFind2 = /(.*easycreadoc\.com\/.*)-.*/;
        const reReplace2 = '$1';

        function findFullsizeUrl(link, src) {
            let fullsizeUrl = src.replace(reFind, reReplace);
            if (fullsizeUrl === src) {
                fullsizeUrl = src.replace(reFind2, reReplace2);
            }
            if (fullsizeUrl === src) return;

            if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
            if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                link.data().hoverZoomSrc.unshift(fullsizeUrl);
                res.push(link);
            }
        }

        $('img[src*="/images/"]').each(function() {
            findFullsizeUrl($(this), this.src);
        });

        $('img[src*="easycreadoc.com"]').each(function() {
            findFullsizeUrl($(this), this.src);
        });

        $('figure, div.card, div.product-item-image').on('mouseover', function() {
            const link = $(this);
            let data = link.data();

            const img = link.find('img[src*="easycreadoc.com"]');
            if (img.length == 1) {
                var url = img[0].src;
                url = url.replace(reFind2, reReplace2);
                data.hoverZoomSrc = [url];
            } else {
                const picture = link.find('picture');
                if (picture.length != 1) return;
                const source = link.find('source');
                if (source[0] == undefined) return;
                var url = source[0].srcset.replace(',http', ', http').split(' ')[0].replace(/,$/, '');
                url = url.replace(reFind, reReplace);
                const urlPng = url.replace('.jpg', '.png');
                data.hoverZoomSrc = [url, urlPng];
            }

            callback(link, name);

            // Cover is displayed iff the cursor is still over the image
            if (link.data().hoverZoomMouseOver)
                hoverZoom.displayPicFromElement(link, true);

        }).on('mouseleave', function () {
            const link = $(this);
            link.data().hoverZoomMouseOver = false;
        });

        $('[style*=url]').each(function() {
            // extract url from style
            var backgroundImage = this.style.backgroundImage;
            const reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            // remove leading & trailing quotes
            var backgroundImageUrl = backgroundImage.replace(/^['"]/, '').replace(/['"]+$/, '');
            findFullsizeUrl($(this), backgroundImageUrl);
        });

        if (res.length) {
            callback($(res), this.name);
        }
    }
});
