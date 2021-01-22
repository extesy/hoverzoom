var hoverZoomPlugins = hoverZoomPlugins || [];

hoverZoomPlugins.push({
  name:'Pinterest',
  prepareImgLinks: function (callback) {
    $('div[data-test-id="pinWrapper"]').one('mouseover', function() {
      var link = $(this),
        data = link.data();
      if (data.hoverZoomSrc) return;
      var img = link.find('img');
      if (img.length === 1 || img.length === 2) {
        var srcset = img.attr('srcset').split(" ");
        link.data().hoverZoomSrc = [srcset[srcset.length - 2]];
        data.hoverZoomCaption = img.attr('alt');
        link.addClass('hoverZoomLink');
      }
    });
  }
});
