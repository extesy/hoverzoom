// Copyright (c) 2010 Romain Vallet
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'weknowmemes',
    version:'0.1',
    prepareImgLinks:function (callback) {
	
         var res = [];
	    hoverZoom.urlReplace(res,'a[href*="weknowmemes.com/generator/meme/"]',
              /.*meme\/(\d+).*/,
            'http://weknowmemes.com/generator/uploads/generated/$1.jpg'
        );
        callback($(res));
		
    }
});