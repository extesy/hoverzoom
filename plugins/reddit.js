// Copyright (c) 2012 Romain Vallet <romain.vallet@gmail.com>
// Licensed under the MIT license, read license.txt

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Reddit',
    version:'0.2',
    prepareImgLinks:function (callback) {
        $('.hoverZoomLink').each(function () {
            var _this = $(this);
            if (options.filterNSFW && _this.parents('.over18').length) {
                _this.removeClass('hoverZoomLink');
            }
            _this.data().hoverZoomCaption = _this.parent().find('a.title').text();
        });
        
        $('.link a.thumbnail img').one('mouseover', function() {
            var link = this.parentNode;
            if (!link.classList.contains('hoverZoomLink')) {
              hoverZoom.prepareFromDocument($(link), link.href, function(doc) {
                  var meta = doc.querySelector('meta[property="og:image"][content]');
                  if (meta && !link.classList.contains('hoverZoomLink')) {
                      return meta.content;
                  } else {
                      return false;
                  }
              });
            }
        });
        
    }
});