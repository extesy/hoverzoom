var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Gamekult',
    version:'0.4',
    prepareImgLinks:function (callback) {
        var res = [];
        
        hoverZoom.urlReplace(res,
            'a img[src*="_1.jpg"]',
            '_1.jpg',
            '_2.jpg'
        );
        
        //sample url: http://d3isma7snj3lcx.cloudfront.net/optim/images/review/30/3050811393/avec-wastelanders-fallout-76-ne-merite-que-la-radiation-4833208c__324_300__515-89-1583-1080.png
        // __324_300__515-89-1583-1080.png
        hoverZoom.urlReplace(res,
            'img[src]',
            /(.*?)_[_-\d]{0,}\.(.*)/,
            '$1.$2'
        );
        
        callback($(res), this.name);
    }
});