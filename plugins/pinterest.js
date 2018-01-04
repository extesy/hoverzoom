var hoverZoomPlugins = hoverZoomPlugins || [];

hoverZoomPlugins.push({
  name:'Pinterest',
  prepareImgLinks: function (callback) {
    $('a.pinImageWrapper').one('mouseover', function() {
      var link = $(this),
        data = link.data();
      if (data.hoverZoomSrc) return;
      var img = link.find('img');
      if (img.length === 1) {
        data.hoverZoomSrc = [img.attr('src').replace(/\/\d+x(\d+)?\//, '/736x/')];
        data.hoverZoomCaption = img.attr('alt');
        link.addClass('hoverZoomLink');
      }
    });
  }
});
