var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Bing_a',
    version:'0.3',
    prepareImgLinks:function (callback) {

        var res = [];        

        //sample url: https://tse4.mm.bing.net/th?id=OIP.ucx89ZiJ_w5UyMlqoJQ5uQHaLB&pid=Api&P=0&w=300&h=300
        //         -> https://tse4.mm.bing.net/th?id=OIP.ucx89ZiJ_w5UyMlqoJQ5uQHaLB
        var regex = /(.*)\?(.*?)&.*/;
        var patch = '$1?$2';

        hoverZoom.urlReplace(res,
            'img[src*=".bing.net/th"]',
            regex,
            patch
        );

        callback($(res), this.name);
    }
});
