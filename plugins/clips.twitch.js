var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'clips.twitch.tv',
    prepareImgLinks:function (callback) {
        $('a[href*="clips.twitch.tv/"]').one('mouseenter', function() {
          var link = this;
          if (link.href.indexOf('reddit.com') !== -1) return;
          if (!link.classList.contains('hoverZoomLink')) {
              hoverZoom.prepareFromDocument($(link), link.href, function (doc) {
                  var meta = doc.querySelector('meta[property="og:image"][content]');
                  link.classList.remove('hoverZoomLink');
                  meta.content = meta.content.replace('-preview.jpg', '.mp4');
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
