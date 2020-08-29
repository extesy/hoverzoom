var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'PublicDomainPictures',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        //sample url : https://publicdomainpictures.net/pictures/370000/t2/view-of-cab-of-old-steam-locomotive.jpg
        //          -> https://publicdomainpictures.net/pictures/370000/velka/view-of-cab-of-old-steam-locomotive.jpg
        hoverZoom.urlReplace(res,
            'img[src]',
            '/t2/',
            '/velka/'
        );

        //sample url : https://as2.ftcdn.net/jpg/02/77/29/25/220_F_277292538_0QTOwR2OqMEuhyEigw0OUMg6GASxGAX7.jpg
        //          -> https://as2.ftcdn.net/jpg/02/77/29/25/1000_F_277292538_0QTOwR2OqMEuhyEigw0OUMg6GASxGAX7.jpg
        hoverZoom.urlReplace(res,
            'img[src]',
            /\/\d+_F/,
            '/1000_F'
        );

        callback($(res));
    }
});