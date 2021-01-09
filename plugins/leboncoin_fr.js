var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Le bon coin',
    version:'0.3',
    prepareImgLinks:function (callback) {
        var res = [];

        hoverZoom.urlReplace(res,
            'img[src*="thumbs"], span.thumbs',
            'thumbs',
            'images'
        );

        //sample url : https://img3.leboncoin.fr/ad-thumb/cc15170487f75709b751a61ee8b52b4ebed2a062.jpg
        //          -> https://img3.leboncoin.fr/ad-large/cc15170487f75709b751a61ee8b52b4ebed2a062.jpg
        hoverZoom.urlReplace(res,
            'img[src]',
            /\/ad-.*?\//,
            '/ad-large/'
        );
        
        //sample url : https://img.leboncoin.fr/api/v1/tenants/9a6387a1-6259-4f2c-a887-7e67f23dd4cb/domains/20bda58f-d650-462e-a72a-a5a7ecf2bf88/buckets/24265337-e7cc-489d-80fc-0c564d62a63b/images/c3/94/77/c39477a76bfe43ba5a164ffda5556324726f0c52.jpg?rule=ad-thumb
        //          -> https://img.leboncoin.fr/api/v1/tenants/9a6387a1-6259-4f2c-a887-7e67f23dd4cb/domains/20bda58f-d650-462e-a72a-a5a7ecf2bf88/buckets/24265337-e7cc-489d-80fc-0c564d62a63b/images/c3/94/77/c39477a76bfe43ba5a164ffda5556324726f0c52.jpg?rule=ad-large
        hoverZoom.urlReplace(res,
            'img[src]',
            /rule=ad-.*/,
            'rule=ad-large'
        );

        callback($(res), this.name);
    }
});
