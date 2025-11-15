var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'Printables',
    version: '1.0',
    prepareImgLinks:function (callback) {
        const res = [];

        hoverZoom.urlReplace(res,
            'img[src*="/thumbs/cover/320x240/jpg/"]',
            ['/thumbs/cover/320x240/jpg/', '.webp'],
            ['/', '.jpg']
        );
        hoverZoom.urlReplace(res,
            'img[src*="/thumbs/cover/320x240/png/"]',
            ['/thumbs/cover/320x240/png/', '.webp'],
            ['/', '.png']
        );
        hoverZoom.urlReplace(res,
            'img[src*="/thumbs/inside/1600x1200/jpg/"]',
            ['/thumbs/inside/1600x1200/jpg/', '.webp'],
            ['/', '.jpg']
        );
        hoverZoom.urlReplace(res,
            'img[src*="/thumbs/inside/1600x1200/png/"]',
            ['/thumbs/inside/1600x1200/png/', '.webp'],
            ['/', '.png']
        );

        $('article.card div.slider').on('mouseover', function() {
            const link = $(this);
            if (link.data().hoverZoomSrc || link.data().hoverZoomGallerySrc) return;
            const img = link.find('a.card-image');
            const modelId = img.attr('href').match(/\/model\/(\d+)-/)[1];
            $.ajax('https://api.printables.com/graphql/', {
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    operationName: 'ModelImages',
                    query: ' \
                        query ModelImages($limit: Int!, $cursor: String, $id: ID!) { \
                          modelImages: morePrintImages(cursor: $cursor, limit: $limit, printId: $id) { \
                            cursor \
                            items { \
                              ...SimpleImage \
                              __typename \
                            } \
                            __typename \
                          } \
                        } \
                        fragment SimpleImage on PrintImageType { \
                          id \
                          filePath \
                          rotation \
                          imageHash \
                          imageWidth \
                          imageHeight \
                          __typename \
                        } \
                    ',
                    variables: {
                        id: modelId,
                        limit: 20,
                    }
                }),
            }).done(function (response) {
                const images = response.data.modelImages.items;
                if (!images || images.length === 0) return;
                const gallery = images.map(img => ['https://media.printables.com/' + img.filePath]);
                if (gallery.length === 0) return;
                if (gallery.length === 1) {
                    link.data().hoverZoomSrc = gallery[0];
                } else {
                    link.data().hoverZoomGallerySrc = gallery;
                }
                callback(link, name);
                hoverZoom.displayPicFromElement(link, true);
            });
        });

        callback($(res), name);
    }
});
