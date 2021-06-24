var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'myanimelist',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample: https://cdn.myanimelist.net/images/clubs/11/354157_thumb.jpg
        // zoomed: https://cdn.myanimelist.net/images/clubs/11/354157.jpg

        // sample: https://cdn.myanimelist.net/s/common/store/cover/6129/8a6a30d4d3fd68771ad396639bc82cda959205b096a4ed17ee6f31de226bb3d2/m.jpg
        // zoomed: https://cdn.myanimelist.net/s/common/store/cover/6129/8a6a30d4d3fd68771ad396639bc82cda959205b096a4ed17ee6f31de226bb3d2/original.jpg

        // sample: https://cdn.myanimelist.net/images/anime/2/73862.webp
        // zoomed: https://cdn.myanimelist.net/images/anime/2/73862l.webp

        // sample: https://cdn.myanimelist.net/r/50x70/images/anime/1223/96541.webp?s=263cff1b768e29f3cc841792b2dded2e
        // zoomed: https://cdn.myanimelist.net/images/anime/1223/96541.webp?s=263cff1b768e29f3cc841792b2dded2e

        // sample: https://cdn.myanimelist.net/r/50x78/images/voiceactors/3/63373.jpg?s=f2d8f3f5a9a42ffe4dc7a64282264cbd
        // zoomed: https://cdn.myanimelist.net/images/voiceactors/3/63373ll.jpg?s=f2d8f3f5a9a42ffe4dc7a64282264cbd

        hoverZoom.urlReplace(res,
            'img[src], [style*=url]',
            [/\/r\/\d+x\d+\//, /\/([lms])\./, '/thumbs/', '_thumb.'],
            ['/', '/original.', '/', '.']
        );

        hoverZoom.urlReplace(res,
            'img[src], [style*=url]',
            [/\/r\/\d+x\d+\//, /\/(\d+)t?\./, /\/([lms])\./, '/thumbs/', '_thumb.'],
            ['/', '/$1l.', '/original.', '/', '.']
        );

        if (res.length) {
            callback($(res), this.name);
        }
    }
});
