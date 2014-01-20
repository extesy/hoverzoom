// Copyright (c) 2013 Romain Vallet
// Licensed under the MIT license, read license.txt
// Contributed by Thomas Efer and Manuel Bissinger <manuel.bissinger@gmail.com>

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Xing.com',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'a img[src*="_s"]',
            /_s[234]/,
            ''
        );
		hoverZoom.urlReplace(res,
            'a.user-card__img--small > img, \
			a.actor > img, \
			a.member > img, \
			a.user-pic > img, \
			a.user-img > img, \
			img.user-pic, \
			a.logo > img, \
			a.user-photo > img.member, \
			a.img-pos > img, \
			a.image-link > img, \
			a.mr5 > img',
            /[,][\d|\D]{1,5}[x]\d{1,3}/,
            ''
        );
		hoverZoom.urlReplace(res,
            'img.ev-image[src*="ad_big"]',
            'ad_big',
            'resized'
        );
		hoverZoom.urlReplace(res,
            'img.ev-image[src*="ad_small"]',
            'ad_small',
            'resized'
        );
		hoverZoom.urlReplace(res,
            'ul.promotional-box-list > li > a > img[src*="connections"]',
            'connections',
            'logo'
        );
		hoverZoom.urlReplace(res,
            'img[src*="thumbnail"]',
            'thumbnail',
            'logo'
        );
        callback($(res));
    }
});
