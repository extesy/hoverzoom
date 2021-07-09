var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Photobucket',
    version:'0.3',
    prepareImgLinks:function (callback) {
        var res = [];
        
        hoverZoom.urlReplace(res,
            'img[src*="th_"]',
            ['//th', '/th_'],
            ['//i', '/'],
            ':first'
        );
        
        //http://rs124.pbsrc.com/albums/p9/Timaestro2/500x_spheremain.jpg~c100  <--- small image
        //http://i124.photobucket.com/albums/p9/Timaestro2/500x_spheremain.jpg  <--- large image
        hoverZoom.urlReplace(res,
            'img[src*="pbsrc"]',
            [/\/\/([a-z]+)/, 'pbsrc', /~.*/],
            ['//i', 'photobucket', '']
        );
        
        //https://i162.photobucket.com/albums/t267/sjc_13/europe/P1010323.jpg?width=200&height=200&crop=1:1,smart
        hoverZoom.urlReplace(res,
            'img[src]',
            /\/\/.*?\./,
            '//hosting.'
        );
        
        callback($(res), this.name);
    }
});
