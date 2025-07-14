var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'nexusmods',
    version: '1.0',
    prepareImgLinks: function(callback) {
        const name = this.name;
        var res = [];

        // https://www.nexusmods.com/

        // sample:   https://media.nexusmods.com/3/c/t/med/3cbc6b07-4436-44db-abce-c6a324e5e48d.png
        // fullsize: https://media.nexusmods.com/3/c/3cbc6b07-4436-44db-abce-c6a324e5e48d.png
        hoverZoom.urlReplace(res,
            'img[src*="nexusmods.com"]',
            /\/t\/(small|med|large)\//,
            '/'
        );

        // sample:   https://staticdelivery.nexusmods.com/mods/1303/images/thumbnails/10913/10913-1670831976-236256850.gif
        // fullsize: https://staticdelivery.nexusmods.com/mods/1303/images/10913/10913-1670831976-236256850.gif
        hoverZoom.urlReplace(res,
            'img[src*="/thumbnails/"]',
            '/thumbnails/',
            '/'
        );

        callback($(res), name);
    }
});
