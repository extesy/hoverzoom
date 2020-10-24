var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Goodreads',
    prepareImgLinks:function (callback) {
        var res = [];

        // The author profile image on a book's page is in a div.
        // But the author profile image on the author's page is in img, handled with urlReplace.
        $('div.bookAuthorProfile__photo').one('mouseenter', function () {
            var div = $(this);
            var data = div.data();
            if (data.hoverZoomSrc) {
                return;
            }

            // Author profile images are similar to user profile images.
            var url = div.css("background-image"); // returns 'url("https://....")'
            url = url.substring(5, url.length - 2).replace(/\/authors\/([0-9]*)p[0-7]\//, '/authors/$1p8/');
            
            data.hoverZoomSrc = [url];
            div.addClass('hoverZoomLink');
            hoverZoom.displayPicFromElement(div);
        });
        
        // Example book cover name: "12345678._SX318_SY475_.jpg"
        // Can also be: "12345678._SX98_.jpg" or "12345678._UY200_.jpg", maybe other stuff too
        // Full size: "12345678.jpg"
        
        // Example profile image name: "https://images.gr-assets.com/users/1234567890p2/12345678.jpg"
        // Replace "p2" with "p8" to get the full size.
        hoverZoom.urlReplace(res,
            'img[src*="gr-assets.com/"]',
            [/\._[a-zA-Z][a-zA-Z].*_\.jpg/, /\/(authors|users|groups)\/([0-9]*)p[0-7]\//],
            ['.jpg', '/$1/$2p8/']
        );
        
        callback($(res));
    }
});
