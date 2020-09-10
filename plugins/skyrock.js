var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Skyrock',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'a img[src*="small"]',
            ['/small.', '_small_'],
            ['/big.', '_']
        );

        hoverZoom.urlReplace(res,
            'a img[src*="_avatar_"]',
            '_avatar_',
            '_'
        );

        hoverZoom.urlReplace(res,
            '#photolist a img[src*="big"]',
            /\?.*$/,
            ''
        );

        //sample url:
        //https://i.skyrock.net/0985/88950985/pics/3331887376_1_38_dKzpHPFD.jpg
        hoverZoom.urlReplace(res,
            'img[src]',
            ['_0_', '_1_', '.0.', '.1.'],
            ['_2_', '_2_', '.2.', '.2.']
        );

        //sample url:
        //https://wir.skyrock.net/wir/v1/profilcrop/?c=isi&im=/0985/88950985/pics/3331887376_1_32_tqV5beqA.jpg&w=264&h=198
        hoverZoom.urlReplace(res,
            'img[src]',
            /http.*im=(.*?)(_|\.).(_|\.)(.*?)&(.*)/,
            'https://mgl.skyrock.net$1$22$3$4'
        );

        callback($(res), this.name);
    }
});
