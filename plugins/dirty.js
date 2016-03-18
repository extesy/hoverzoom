// Copyright (c) 2015 Oleg Anashkin <oleg.anashkin@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
  name:'dirty.ru',
  version:'0.1',
  prepareImgLinks:function (callback) {
    var res = [];
    $('[data-src]').filter(function () {
      return $(this).data('src').match(/\/[^:]+\.(?:jpe?g|gifv?|png|webm|mp4|3gpp|svg|webp|bmp|ico|xbm)(?:[\?#].*)?$/i);
    }).each(function () {
      var _this = $(this), data = _this.data();
      if (!data.hoverZoomSrc) {
        data.hoverZoomSrc = [data.src];
        res.push(_this);
      }
    });

    if (res.length) {
      callback($(res));
    }
  }
});
