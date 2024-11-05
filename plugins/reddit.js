var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
  name: 'Reddit',
  version: '0.3',
  prepareImgLinks: function (callback) {
    // https://preview.redd.it/example.png?width=640&amp;...
    function transformPreviewUrl(url) {
      url = url.replace('preview', 'i');
      url = url.slice('0', url.indexOf('?'));
      return url;
    }

    // https://external-preview.redd.it/example.jpg?width=640...
    function transformExternalPreviewUrl(url) {
      if (url.indexOf('&amp') !== -1) {
        url = url.replaceAll('&amp%3B', '&');
        url = url.replaceAll('&amp;', '&');
      }
      return url;
    }

    $('.hoverZoomLink').each(function () {
      let _this = $(this);
      if (options.filterNSFW && _this.parents('.over18').length) {
        _this.removeClass('hoverZoomLink');
      }
      _this.data().hoverZoomCaption = _this.parent().find('a.title').text();
    });

    $('.Post').one('mouseover', function() {
      var post = $(this);

      var gallery = post.find('ul');
      if (gallery.length > 0) {
        // Remove default hoverzoom processing to avoid gallery being processed as single image
        post.find('.hoverZoomLink').each(function() {
          $(this).removeClass('hoverZoomLink');
        })

        var items = gallery.find('img');

        var src = [];
        items.each(function() {
          var item = $(this)
          src.push([transformPreviewUrl(item.attr('src'))]);
        });

        hoverZoom.prepareLink(gallery, src);
      }

      var img = post.find('img.ImageBox-image');
      if (img.length > 0) {
        var src = img.attr('src');

        switch (src.slice(8, src.indexOf('.'))) {
        case 'preview':
          src = transformPreviewUrl(src);
          break;
        case 'external-preview':
          src = transformExternalPreviewUrl(src);
        }

        hoverZoom.prepareLink(img, src);
      }
    });

    $('a[href*="//external-preview.redd.it/"]').each(function () {
      const post = $(this);
      let href = post.attr('href');

      href = transformExternalPreviewUrl(href)
      post.attr('href', href);
      post.data('hoverZoomSrc', [href]);
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

    // To load Image from thumbnail in searches in sh.reddit
    $('faceplate-tracker[data-faceplate-tracking-context*="post_thumbnail"]').each(function () {
      let img = $(this);
      let url = this.children[0].href;
      chrome.runtime.sendMessage({action:'ajaxRequest', url: url, method: 'GET'}, function(data) {
        let doc = document.implementation.createHTMLDocument();
        doc.body.innerHTML = data;

        let post = $(doc.querySelector('shreddit-post'));
        let link = post.attr('content-href');
        let type = post.attr('post-type');
        if (link.search('.gifv') != -1) { type = 'video' }

        switch (type) {
          case 'video': {
            let title = post.attr('post-title');
            img.data('hoverZoomSrc', [link + '/DASH_480.mp4', link + '/DASH_360.mp4']);
            if (link.search('.gifv') != -1) {
              img.data('hoverZoomSrc', [link.replace(/\.gifv?/, '.mp4'), link.replace(/\.gifv?/, '.webm')]);
            }
            img.data('hoverZoomCaption', [title]);
            img.addClass('hoverZoomLink');
            return
          }
          case 'gallery': {
            let galleryid = post.attr('id');
            $.get('https://www.reddit.com/by_id/' + galleryid + '.json?raw_json=1', data => processGalleryResponse(img, data));
            return
          }
          case 'link': 
            link = post.find('img[src*="external-preview.redd.it"]:first').attr('src');
          default:
          }
          hoverZoom.prepareLink(img, link);
      });
    });

    // Load images in sh.reddit
    $('shreddit-post[content-href*="//i.redd.it"], img.i18n-post-media-img').one('mouseover', function () {
      let post = $(this);
      let link = post.attr('content-href');
      hoverZoom.prepareLink(post, link);
    });

    // Supports videos in sh.reddit card view 
    $('shreddit-player-2').one('mouseover', function () {
      let post = $(this);
      let src = post.attr('src');
      let packagedMedia = post.attr('packaged-media-json');

      if (packagedMedia) {
        src = 'https://' + packagedMedia.match(/"source":{"url":".*(packaged-media.redd.it\/.*)","dimensions"/)[1];
      }
      hoverZoom.prepareLink(post, src);
    });
    
    var promises = [];

    $('div[data-url*="//i.redd.it/"], div[data-url*="//i.reddituploads.com/"]').each(function () {
      var post = $(this);
      var link = post.attr('data-url');
      var title = post.find('a.title').text();
      post.find('a.thumbnail,a.title').each(function () {
        var img = $(this);
        img.data('hoverZoomSrc', [link]);
        img.data('hoverZoomCaption', [title]);
        promises.push(Promise.resolve(img));
      });
    });

    function processGalleryResponse(post, data) {
      if (data && data.data) {
        var gallery_data = data.data.children[0].data.gallery_data;
        var media_metadata = data.data.children[0].data.media_metadata;
        if (gallery_data != null && media_metadata != null) {
          var items = gallery_data.items;
          var src = items
            .filter(item => media_metadata[item.media_id].status === 'valid')
            .map(item => ['https://i.redd.it/' + item.media_id + '.' + media_metadata[item.media_id].m.substring(6)]);
          var img = post.find('a.title');
          if (img.length === 0)
            img = post.find('a.thumbnail');
          if (img.length === 0)
            img = post;
          hoverZoom.prepareLink(img, src);
          post.data().hoverZoomMouseOver = false;
        }
      }
    }

    $('div[data-url*="//www.reddit.com/gallery/"]').one('mouseover', function () {
      let post = $(this);
      if (post.data().hoverZoomMouseOver) return;
      post.data().hoverZoomMouseOver = true;
      let galleryid = post.attr('id');
      $.get('https://www.reddit.com/by_id/t3_' + galleryid + '.json?raw_json=1', data => processGalleryResponse(post, data));
    });

    $('a[href*="//www.reddit.com/gallery/"]').one('mouseover', function () {
      let post = $(this);
      if (post.data().hoverZoomMouseOver) return;
      post.data().hoverZoomMouseOver = true;
      let link = post.attr('href');
      let galleryid = link.substring(link.lastIndexOf('/') + 1);
      $.get('https://www.reddit.com/by_id/t3_' + galleryid + '.json?raw_json=1', data => processGalleryResponse(post, data));
    });

    $('shreddit-post[content-href*="//www.reddit.com/gallery/"]').one('mouseover', function () {
      let post = $(this);
      if (post.data().hoverZoomMouseOver) return;
      post.data().hoverZoomMouseOver = true;
      let link = post.attr('content-href');
      let galleryid = link.substring(link.lastIndexOf('/') + 1);
      $.get('https://www.reddit.com/by_id/t3_' + galleryid + '.json?raw_json=1', data => processGalleryResponse(post, data));
    });
    
    $('div[data-is-gallery=true]').one('mouseover', function () {
      let post = $(this);
      if (post.data().hoverZoomMouseOver) return;
      post.data().hoverZoomMouseOver = true;
      let galleryid = post.attr('data-fullname');
      $.get('https://www.reddit.com/by_id/' + galleryid + '.json?raw_json=1', data => processGalleryResponse(post, data));
    });

    // supports sh.reddit card view galleries
    $('gallery-carousel').one('mouseover', function () {
      let post = $(this);
      if (post.data().hoverZoomMouseOver) return;
      post.data().hoverZoomMouseOver = true;
      let galleryid = post.attr('post-id');
      $.get('https://www.reddit.com/by_id/' + galleryid + '.json?raw_json=1', data => processGalleryResponse(post, data));
    });

    $('div[data-url*="//v.redd.it/"],shreddit-post[content-href*="//v.redd.it/"],shreddit-post[content-href*="https://i.imgur.com/"]').each(function () {
      let post = $(this);
      let link = post.attr('data-url') || post.attr('content-href');
      let title = post.find('a.title').text() || post.attr('post-title');
      let hoverTargets =  post.attr('data-url') ? 'a.thumbnail,a.title' : 'a.absolute.inset-0'
      post.find(hoverTargets).each(function() {
        let img = $(post);

        // Use /DASH_600_K as a default if for any reason the ajax request below doesn't find a valid link
        // In case of imgur link, replace .gifv with .mp4 or .webm
        img.data('hoverZoomSrc', [link + '/DASH_600_K',link.replace(/\.gifv?/, '.mp4'),link.replace(/\.gifv?/, '.webm')]);
        img.data('hoverZoomCaption', [title]);

        promises.push(new Promise(function (resolve, reject) {
          chrome.runtime.sendMessage(
            { action:'ajaxRequest', url: link + '/DASHPlaylist.mpd', method: 'GET' },
            function (xml) {
              try {
                let xmlDoc = (new DOMParser()).parseFromString(xml, 'application/xml');
                let highestRes = [].slice.call(xmlDoc.querySelectorAll('Representation[frameRate]'))
                  .sort(function (r1, r2) {
                    let w1 = parseInt(r1.getAttribute('width')), w2 = parseInt(r2.getAttribute('width'));
                    return w1 > w2 ? -1 : (w1 < w2 ? 1 : 0);
                  })
                  .find(function (repr) { return !!repr.querySelector('BaseURL'); });

                if (highestRes) {
                  let baseUrl = highestRes.querySelector('BaseURL').textContent.trim();
                  img.data('hoverZoomSrc', [baseUrl.indexOf('//') !== -1 ? baseUrl : link + '/' + baseUrl]);
                }

                let audio = xmlDoc.querySelector('Representation[audioSamplingRate]'),
                  audioUrl = audio ? audio.querySelector('BaseURL').textContent.trim() : undefined;
                if (audioUrl) {
                  img.data('hoverZoomAudioSrc', [audioUrl.indexOf('//') !== -1 ? audioUrl : link + '/' + audioUrl]);
                }

                resolve(img);
              } catch (err) {
                reject(err);
              }
          });
        }));
      });
    });

    Promise.all(promises.map(function (p) {
      return p.catch(function(err) { console.error('Error initializing reddit image', err); });
    })).then(function (res) { callback($(res), this.name); })
  }
});
