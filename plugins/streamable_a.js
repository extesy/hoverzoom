var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
  name: 'Streamable',
  prepareImgLinks: function (callback) {
    $('a[href*="//streamable.com/"]').one('mouseover', function () {
      hoverZoom.prepareFromDocument($(this), this.href, function(doc) {
        return doc.querySelector('source').getAttribute('src');
      });
    });
  }
});
