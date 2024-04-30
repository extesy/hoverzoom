var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push( {
    name: 'unsplash',
    version: '1.0',
    prepareImgLinks: function(callback) {
        var name = this.name;
        var res = [];

        // sample: https://images.unsplash.com/photo-1713769931183-1537d9a8126b?w=2000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwxfHx8ZW58MHx8fHx8
        //      -> https://images.unsplash.com/photo-1713769931183-1537d9a8126b
        
        $('img[src]').each(function () {
            var link = $(this);
            const src = this.src.replace(/(.*)\?.*/, '$1');
            link.data().hoverZoomSrc = [src];
            res.push(link);
        });

        callback($(res), name);
    }
});
