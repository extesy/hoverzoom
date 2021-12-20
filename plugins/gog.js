var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'GOG',
    version:'1.0',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample: https://images.gog-statics.com/53256264ce6987835ad2d4384117178b8a5aad6b6a6cbc27c4ec1c45f3dfa151_product_card_v2_mobile_slider_639.jpg
        //      -> https://images.gog-statics.com/53256264ce6987835ad2d4384117178b8a5aad6b6a6cbc27c4ec1c45f3dfa151.jpg
        hoverZoom.urlReplace(res,
            'img.productcard-thumbnails-slider__image',
            /_product_card_.+\d+/,
            ''
        );

        $('div.product-tile__cover,div.product-tile__image-wrapper').one('mouseover', function () {
            var link = $(this);
            var sources = link.find('source');
            if (sources.length == 0) return;
            var srcset = sources.first().attr('srcset').split(',');
            var src = srcset[srcset.length-1].trim().split(' ')[0];
            // sample: //images-2.gog-statics.com/c0a40a3c31a46d4bf1f7d4454f4c4da5bb4f76d85ddaba20485b7c3a793c5610_product_tile_116.webp
            //      -> //images-2.gog-statics.com/c0a40a3c31a46d4bf1f7d4454f4c4da5bb4f76d85ddaba20485b7c3a793c5610.webp
            src = src.replace(/_product_tile_.+?\d+w?(_\dx)?/, '');
            hoverZoom.prepareLink(link, src);
        });

        $('img.menu-product__image,img.product-row__img').one('mouseover', function () {
            var link = $(this);
            var srcset = link.attr('srcset').split(',');
            var src = srcset[srcset.length-1].trim().split(' ')[0];
            // sample: https://images.gog-statics.com/b063c46a7e35ba1925653cefcea5014728f1cc0c54880b2f5978eff8f488e9d7_392.jpg
            //      -> https://images.gog-statics.com/b063c46a7e35ba1925653cefcea5014728f1cc0c54880b2f5978eff8f488e9d7.jpg
            src = src.replace(/_\d+/, '');
            hoverZoom.prepareLink(link, src);
        });

        callback($(res), this.name);
    }
});
