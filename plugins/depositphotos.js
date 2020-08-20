var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Depositphotos',
    version:'1.0',
    prepareImgLinks:function (callback) {

        var res = [];

        //sample url: https://static.depositphotos.com/storage/avatars/1298/12982378/m_12982378.jpg
        //         -> https://static.depositphotos.com/storage/avatars/1298/12982378/p_12982378.jpg
        //sample url: https://st3.depositphotos.com/7238240/32199/i/111/depositphotos_321992796-stock-photo-a-beautiful-afternoon-view-of.jpg
        //         -> https://st3.depositphotos.com/7238240/32199/i/950/depositphotos_321992796-stock-photo-a-beautiful-afternoon-view-of.jpg
        var regex1 = /\/m_/;
        var patch1 = '/p_';
        var regex2 = /\/\d{3}\//;
        var patch2 = '/950/';

        hoverZoom.urlReplace(res,
            'img[src]',
            [regex1, regex2],
            [patch1, patch2],
            'a'
        );

        //sample url: https://st3.depositphotos.com/7238240/32199/i/111/depositphotos_321992796-stock-photo-a-beautiful-afternoon-view-of.jpg
        //         -> https://st3.depositphotos.com/7238240/32199/i/1600/depositphotos_321992796-stock-photo-a-beautiful-afternoon-view-of.jpg
        var regex3 = /\/\d{3}\//;
        var patch3 = '/1600/';

        hoverZoom.urlReplace(res,
            'img[src]',
            regex3,
            patch3,
            'a'
        );

        callback($(res));
    }
});
