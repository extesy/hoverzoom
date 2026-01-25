var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'huaban',
    version: '1.2',
    favicon:'huaban.ico',
    prepareImgLinks: function(callback) {
        var res = [];

        // sample:   https://gd-hbimg-edge.huaban.com/1d639883002d998d9b30bfea3f9f11d97ac6f01b15e8f2-xRFNlB_fw240webp?auth_key=1769198400-08a758110b9044818fffce6c76fec725-0-4356c12a80ea595a77adf6f9e38e52e3
        // fullsize: https://gd-hbimg-edge.huaban.com/1d639883002d998d9b30bfea3f9f11d97ac6f01b15e8f2-xRFNlB?auth_key=1769198400-08a758110b9044818fffce6c76fec725-0-4356c12a80ea595a77adf6f9e38e52e3
        // sample:   https://gd-hbimg-edge.huaban.com/small/f05ef54f7c6ac98030b959393de1e250aea59ebf31c2d-8xHkOh?auth_key=1769198400-08a758110b9044818fffce6c76fec725-0-68b6462081cfd37cd39bb3437b130259
        // fullsize: https://gd-hbimg-edge.huaban.com/f05ef54f7c6ac98030b959393de1e250aea59ebf31c2d-8xHkOh?auth_key=1769198400-08a758110b9044818fffce6c76fec725-0-68b6462081cfd37cd39bb3437b130259
        hoverZoom.urlReplace(res,
            'img[src*="huaban.com"],div',
            [/\/small\//, /https:\/\/gd-hbimg-edge.huaban.com\/(.*?)_(.*)\?(.*)/],
            ['/', 'https://gd-hbimg-edge.huaban.com/$1?$3'],
            'a'
        );

        // sample:   https://gd-hbimg-edge.huaban.com/1d639883002d998d9b30bfea3f9f11d97ac6f01b15e8f2-xRFNlB_fw240webp?auth_key=1769198400-08a758110b9044818fffce6c76fec725-0-4356c12a80ea595a77adf6f9e38e52e3
        // fullsize: https://gd-hbimg-edge.huaban.com/1d639883002d998d9b30bfea3f9f11d97ac6f01b15e8f2-xRFNlB?auth_key=1769198400-08a758110b9044818fffce6c76fec725-0-4356c12a80ea595a77adf6f9e38e52e3
        // sample:   https://gd-hbimg-edge.huaban.com/small/f05ef54f7c6ac98030b959393de1e250aea59ebf31c2d-8xHkOh?auth_key=1769198400-08a758110b9044818fffce6c76fec725-0-68b6462081cfd37cd39bb3437b130259
        // fullsize: https://gd-hbimg-edge.huaban.com/f05ef54f7c6ac98030b959393de1e250aea59ebf31c2d-8xHkOh?auth_key=1769198400-08a758110b9044818fffce6c76fec725-0-68b6462081cfd37cd39bb3437b130259
        hoverZoom.urlReplace(res,
            'img[src*="huaban.com"],div',
            [/\/small\//, /https:\/\/gd-hbimg-edge.huaban.com\/(.*?)_(.*)\?(.*)/],
            ['/', 'https://gd-hbimg-edge.huaban.com/$1?$3']
        );

        // gaoding
        // sample:   https://gd-filems.dancf.com/195209042/presigned/3d4908a81c2e4759a8f1580f1be062db664483.jpg?x-oss-process=image/resize,w_800,type_6/sharpen,120/interlace,1
        // fullsize: https://gd-filems.dancf.com/195209042/presigned/3d4908a81c2e4759a8f1580f1be062db664483.jpg
        hoverZoom.urlReplace(res,
            'img[src*="dancf.com"],div',
            /(.*)\?.*/,
            '$1',
            'a'
        );

        // gaoding
        // sample:   https://gd-filems.dancf.com/195209042/presigned/3d4908a81c2e4759a8f1580f1be062db664483.jpg?x-oss-process=image/resize,w_800,type_6/sharpen,120/interlace,1
        // fullsize: https://gd-filems.dancf.com/195209042/presigned/3d4908a81c2e4759a8f1580f1be062db664483.jpg
        hoverZoom.urlReplace(res,
            'img[src*="dancf.com"],div',
            /(.*)\?.*/,
            '$1'
        );

        callback($(res), this.name);
    }
});