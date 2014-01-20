// Copyright (c) 2010 Romain Vallet
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Threadless',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            //'a[href*="/product/"] img[src*="threadlesskids"], a.thumblink img, a[href^="/gallery/"] img, img.product',
            'img[src*="-minizoom"], img[src*="-view"]',
            /product\/\d+x\d+\/(\d+)-/,
            'product/$1/'
        );
        hoverZoom.urlReplace(res,
            'a[href*="/product/"] img',
            /\d+x\d+/,
            '636x460'
        );
        $('td').filter(function () {
            return this.style && this.style.backgroundImage && this.style.backgroundImage.indexOf('subs/small') > 1;
        }).add('img[src*="subs/small"]').each(function () {
                var _this = $(this),
                    url = hoverZoom.getThumbUrl(this);
                url = url.replace('small', 'big').replace('t.', '.');
                url = url.substr(0, url.lastIndexOf('.'));
                _this.data().hoverZoomSrc = [url + '.jpg', url + '.png', url + '.gif'];
                res.push(_this);
            });
        $('img[src*="/profiles/"]:not([src*="noimage"]), img[src*="teeriffic"], .product_image').each(function () {
            var _this = $(this),
                url = hoverZoom.getThumbUrl(this);
            url = url.replace(/\/\d+x\d+/, '');
            url = url.substr(0, url.lastIndexOf('.'));
            _this.data().hoverZoomSrc = [url + '.jpg', url + '.gif', url + '.png'];
            res.push(_this);
        });
        callback($(res));
    }
});