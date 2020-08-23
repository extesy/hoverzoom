var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'airbnb',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        //sample url: https://a0.muscache.com/im/pictures/user/3c01295d-fb10-40aa-a7d2-cdaf373cc886.jpg?im_w=240
        //         -> https://a0.muscache.com/im/pictures/user/3c01295d-fb10-40aa-a7d2-cdaf373cc886.jpg
        var regex1 = /im_w=([^&*]{1,})(&?.*)/;
        var patch1 = '$2';

        //sample url: https://a0.muscache.com/im/pictures/4a150531-75c6-4480-86c6-7efa8b98324f.jpg?aki_policy=large&size=100
        //         -> https://a0.muscache.com/im/pictures/4a150531-75c6-4480-86c6-7efa8b98324f.jpg?aki_policy=xx_large
        var regex2 = /aki_policy=([^&*]{1,})(&?.*)/;
        var patch2 = 'aki_policy=xx_large$2';


        hoverZoom.urlReplace(res,
            'img[src]',
            [regex1, regex2],
            [patch1, patch2]
        );

        callback($(res));
    }
});