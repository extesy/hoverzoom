var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'otempo',
    version:'0.1',
    prepareImgLinks:function (callback) {

        var pluginName = this.name;
        var res = [];

        // https://https://www.otempo.com.br/

        // images
        // thumbnail: https://www.otempo.com.br/adobe/dynamicmedia/deliver/dm-aid--ba632b85-8ffd-4298-b06b-7027ba369715/entretenimento-lo-borges-clube-da-esquina-entretenimento2025ttributo-l--borges-1764525973.jpg?quality=90&width=300&preferwebp=true
        // fullsize:  https://www.otempo.com.br/adobe/dynamicmedia/deliver/dm-aid--ba632b85-8ffd-4298-b06b-7027ba369715/entretenimento-lo-borges-clube-da-esquina-entretenimento2025ttributo-l--borges-1764525973.jpg

        hoverZoom.urlReplace(res,
            'img[src*="adobe"]',
            /\?.*/,
            ''
        );

        callback($(res), name);
    }
});
