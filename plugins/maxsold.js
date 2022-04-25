var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'maxsold',
    version: '0.1',
    prepareImgLinks: function(callback) {
        var res = [];

        // sample: https://maxsold.maxsold.com/auction/litchfield-park-arizona-usa-moving-online-auction-west-estero-lane-29601/bidgallery/
        // thumbnail : https://d12srav5gxm0re.cloudfront.net/auctionimages/29601/1618939049/w29601-myFile-1618615279108_t.jpeg
        //  fullsize : https://d12srav5gxm0re.cloudfront.net/auctionimages/29601/1618939049/w29601-myFile-1618615279108.jpeg

        hoverZoom.urlReplace(res,
            'img[src]',
            '_t.',
            '.'
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            ['/thumbs/', '/thumbsbig/'],
            ['/', '/']
        );

        callback($(res), this.name);
    }
});
