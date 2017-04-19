var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
  name:'Pinterest',
  prepareImgLinks:function (callback) {
    var res = [];
    $('div.pin').each(function(){
      var _this = $(this),
        img = _this.find('img.PinImageImg'),
        url = this.dataset ? this.dataset.closeupUrl : false;
      if (img.length) {
        if (!url) {
          url = img.attr('src').replace('/192/', '/550/')
        }
        img.data().hoverZoomSrc = [url];
        res.push(img);
      }
    });
    hoverZoom.urlReplace(res,
      'img[src*="/avatars/"]',
      /_\d+\.jpg/,
      '_140.jpg',
      ':eq(0)'
    );
    callback($(res));
    $('img.pinImg,div.pinImageDim').parents('a').one('mouseover', function() {
      var link = $(this),
        data = link.data();
      if (data.hoverZoomSrc) { return; }
      var img = link.find('img');
      if (img.length == 1) {
        data.hoverZoomSrc = [img.attr('src').replace(/\/\d+x(\d+)?\//, '/736x/')];
        data.hoverZoomCaption = link.parents('.pinWrapper').find('.pinDescription').text();
        link.addClass('hoverZoomLink');
      }
    });
  }
});
