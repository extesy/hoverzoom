var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Gawker',
    version:'0.3',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="img.gawkerassets.com"]',
            /(gallery|medium|small|xsmall|micro)(_\d+)?/,
            'xlarge'
        );
        hoverZoom.urlReplace(res,
            'img[src*="gizmodo.jp/assets_c"]',
            /^.*\/([^\/]*)-thumb-.*$/,
            'http://img.gizmodo.jp/upload_files2/$1.jpg'
        );
        hoverZoom.urlReplace(res,
            'img.CommenterImage',
            /_\d+\./,
            '_160.'
        );
        hoverZoom.urlReplace(res,
            'a img.FB_profile_pic',
            /_[sqta]\./,
            '_n.'
        );
        hoverZoom.urlReplace(res,
            'img[src*="/wp/"], img[src*="/wp-content/"]',
            /-\d+x\d+\./,
            '.'
        );
        hoverZoom.urlReplace(res,
            'img[src*="_thumb."]',
            '_thumb.',
            '.'
        );
        callback($(res));
    }
});