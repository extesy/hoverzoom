var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Rakuten',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src*="?_ex="]',
            /\?_ex=.*$/,
            ''
        );

        // thumbnail: https://fr.shopping.rakuten.com/photo/2391265187_L_NOPAD.jpg
        //  fullsize: https://fr.shopping.rakuten.com/photo/2391265187.jpg
        hoverZoom.urlReplace(res,
            'img[src*="_"]',
            /_(XS|S|M|MS|ML|L).*?\./,
            '.'
        );

        callback($(res), this.name);
    }
});
