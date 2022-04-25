var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'cgsociety.org',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];   
        
        hoverZoom.urlReplace(res,
            'img[src]',
            ['_300.', '_600.', '_large.'],
            ['_orig.', '_orig.', '_orig.']
        );
        
         hoverZoom.urlReplace(res,
            'div[style*="background"]',
            ['_300.', '_600.', '_large.'],
            ['_orig.', '_orig.', '_orig.']
        );
        
        hoverZoom.urlReplace(res,
            'img[src]',
            ['/thumbnail/', '/thumb/', '/xs/', '/xsmall/', '/small/', '/tiny/', '/micro/', '/preview/', '/medium/', '/channel/', '/channel_2x/', '/channel_3x/'],
            ['/large/', '/large/', '/large/', '/large/', '/large/', '/large/', '/large/', '/large/', '/large/', '/large/', '/large/', '/large/']
        );
        
        hoverZoom.urlReplace(res,
            'img[src]',
            ['/thumbnail/', '/thumb/', '/xs/', '/xsmall/', '/small/', '/tiny/', '/micro/', '/preview/', '/medium/', '/channel/', '/channel_2x/', '/channel_3x/', '/large/'],
            ['/original/', '/original/', '/original/', '/original/', '/original/', '/original/', '/original/', '/original/', '/original/', '/original/', '/original/', '/original/', '/original/']
        );
          
        hoverZoom.urlReplace(res,
            'img[src]',
            ['/thumbnail/', '/thumb/', '/xs/', '/xsmall/', '/small/', '/tiny/', '/micro/', '/preview/', '/medium/', '/channel/', '/channel_2x/', '/channel_3x/', '/large/'],
            ['/orig/', '/orig/', '/orig/', '/orig/', '/orig/', '/orig/', '/orig/', '/orig/', '/orig/', '/orig/', '/orig/', '/orig/', '/orig/']
        );
        
        callback($(res), this.name);
    }
});