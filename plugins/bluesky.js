var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'bluesky_a',
    version: '1.0',
    prepareImgLinks: function(callback) {
        const name = this.name;
        var res = [];

        // https://bsky.app/profile/nilbog3000.bsky.social
        // sample:   https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:y7uaje2eyoamgdh7ie7zko6i/bafkreiargh3ss4az2s27xmo2lpfbdvqkfqxfyapfnbagdq57frfz3qlz4e@jpeg
        // fullsize: https://cdn.bsky.app/img/feed_fullsize/plain/did:plc:y7uaje2eyoamgdh7ie7zko6i/bafkreiargh3ss4az2s27xmo2lpfbdvqkfqxfyapfnbagdq57frfz3qlz4e@jpeg
        hoverZoom.urlReplace(res,
            'img[src*="cdn.bsky.app/img/feed_thumbnail/"], img[src*="cdn.bsky.app/img/banner/"], img[src*="cdn.bsky.app/img/avatar/"]',
            ['/feed_thumbnail/', '/banner/', '/avatar/'],
            ['/feed_fullsize/', '/feed_fullsize/', '/feed_fullsize/']
        );

        callback($(res), name);
    }
});
