var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
  name: 'Reddit',
  version: '0.2',
  prepareImgLinks: function (callback) {
    $('.hoverZoomLink').each(function () {
      var _this = $(this);
      if (options.filterNSFW && _this.parents('.over18').length) {
        _this.removeClass('hoverZoomLink');
      }
      _this.data().hoverZoomCaption = _this.parent().find('a.title').text();
    });

    $('.link a.thumbnail, .link a.title').one('mouseover', function () {
      var link = this;
      if (link.href.indexOf('reddit.com') !== -1) return;
      if (!link.classList.contains('hoverZoomLink')) {
        hoverZoom.prepareFromDocument($(link), link.href, function (doc) {
          var meta = doc.querySelector('meta[property="og:image"][content]');
          if (meta && !link.classList.contains('hoverZoomLink')) {
            return meta.content;
          } else {
            return false;
          }
        });
      }
    });

    var res = [];

    $('a[href*="//i.reddituploads.com/"]').each(function () {
      var img = $(this);
      img.data('hoverZoomSrc', [img.attr('href')]);
      img.data('hoverZoomCaption', [img.text()]);
      res.push(img);
    });

    $('div[data-cachedhtml*="//i.redd.it/"]').each(function () {
      var div = $(this);
      var html = $(div.attr('data-cachedhtml'));
      var anchor = html.find('a[href*="//i.redd.it/"]');
      if (anchor.length > 0) {
        var link = anchor.attr('href');
        var post = div.parent().parent();
        var title = post.find('a.title').text();
        post.find('a').each(function () {
          var img = $(this);
          img.data('hoverZoomSrc', [link]);
          img.data('hoverZoomCaption', [title]);
          res.push(img);
        });
      }
    });

    callback($(res));
  }
});
