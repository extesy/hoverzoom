var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Photobucket',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="th_"]',
            ['//th', '/th_'],
            ['//i', '/'],
            ':first'
        );
        
        //ex:
        //http://rs124.pbsrc.com/albums/p9/Timaestro2/500x_spheremain.jpg~c100  <--- small image
        //http://i124.photobucket.com/albums/p9/Timaestro2/500x_spheremain.jpg  <--- large image
        hoverZoom.urlReplace(res,
            'img[src*="pbsrc"]',
            [/\/\/([a-z]+)/, 'pbsrc', /~.*/],
            ['//i', 'photobucket', '']
        );
        callback($(res));
    }
});
