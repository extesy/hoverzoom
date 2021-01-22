var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Pixnet.net',
    version:'0.2',
    prepareImgLinks:function (callback) {
        var res = [];
        hoverZoom.urlReplace(res,
            'img[src*="_s."]',
            '_s.',
            options.showHighRes ? '.' : '_b.'
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            /\/zoomcrop\/\d+x\d+\./,
            '/zoomcrop/130x130.'
        );

        hoverZoom.urlReplace(res,
            'img[src]',
            '_n.jpg',
            '.jpg'
        );

        //sample url:
        //https://imageproxy.pimg.tw/resize?url=https%3A%2F%2Flive.staticflickr.com%2F65535%2F49745339392_2ebe339af0_b.jpg&maxwidth=530&maxheight=530
        $('img[src]').each(function() {
           var url = this.src;
           try {
              url = url.replace(/http.*url=(.*?)(&|\?).*/, '$1');
              // decode ASCII characters, for instance: '%2C' -> ','
              // NB: this operation must be try/catched because url might not be well-formed
              var fullsizeUrl = decodeURIComponent(url);
              if (fullsizeUrl != url) {
                 var link = $(this);
                 if (link.data().hoverZoomSrc == undefined) { link.data().hoverZoomSrc = [] }
                 if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
                    link.data().hoverZoomSrc.unshift(fullsizeUrl);
                    res.push(link);
                 }
              }
           }
           catch(e) {}
        });

        callback($(res), this.name);
    }
});
