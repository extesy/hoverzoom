var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
  name: 'Reddit',
  version: '0.3',
  prepareImgLinks: function (callback) {
    $('.hoverZoomLink').each(function () {
      var _this = $(this);
      if (options.filterNSFW && _this.parents('.over18').length) {
        _this.removeClass('hoverZoomLink');
      }
      _this.data().hoverZoomCaption = _this.parent().find('a.title').text();
    });

    $('a.outbound.thumbnail, a.outbound.title').one('mouseover', function () {
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

    var imagesDone = false, videosDone = false;
    var res = [];

    function done () {
      if (imagesDone && videosDone) {
        callback($(res));
      }
    }

    $('div[data-url*="//i.redd.it/"], div[data-url*="//i.reddituploads.com/"]').each(function () {
      var post = $(this);
      var link = post.attr('data-url');
      var title = post.find('a.title').text();
      post.find('a.thumbnail,a.title').each(function () {
        var img = $(this);
        img.data('hoverZoomSrc', [link]);
        img.data('hoverZoomCaption', [title]);
        res.push(img);
      });

      imagesDone = true;
      done();
    });

    $('div[data-url*="//v.redd.it/"]').each(function () {
      var post = $(this);
      var link = post.attr('data-url');
      var title = post.find('a.title').text();
      var links = [].slice.call(post.find('a.thumbnail,a.title'));
      var linksDone = links.map(function () { return false; });

      function linkDone (i) {
        linksDone[i] = true;
        if (linksDone.every(function (b) { return b; })) {
          videosDone = true;
          done();
        }
      }

      links.forEach(function (a, i) {
        var img = $(a);

        // Use /DASH_600_K as a default if for any reason the ajax request below doesn't find a valid link
        img.data('hoverZoomSrc', [link + '/DASH_600_K']);
        img.data('hoverZoomCaption', [title]);

        $.get(link + '/DASHPlaylist.mpd', function (xmlDoc) {
          var highestRes = [].slice.call(xmlDoc.querySelectorAll('Representation[mimeType^="video"]'))
            .sort(function (r1, r2) {
              var w1 = parseInt(r1.getAttribute('width')), w2 = parseInt(r2.getAttribute('width'));
              return w1 > w2 ? -1 : (w1 < w2 ? 1 : 0);
            })
            .find(function (repr) { return !!repr.querySelector('BaseURL'); });

          if (highestRes) {
            img.data('hoverZoomSrc', [link + '/' + highestRes.querySelector('BaseURL').textContent.trim()]);
          }

          var audio = xmlDoc.querySelector('Representation[mimeType^="audio"'),
              audioUrl = audio ? audio.querySelector('BaseURL') : undefined;
          if (audioUrl) {
            img.data('hoverZoomAudioSrc', [link + '/' + audioUrl.textContent.trim()]);
          }

          linkDone(i);
        });

        res.push(img);
      });
    });
  }
});
