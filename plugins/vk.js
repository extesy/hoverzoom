var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'VK.com',
    version:'0.1',
    prepareImgLinks:function (callback) {

        function prepareFromPhotoId(link, photoId, listId) {
            if (!listId) {
                listId = 'photos' + photoId.match(/(\d+)_/)[1];
            }
            chrome.runtime.sendMessage({action:'ajaxRequest',
                    url:'http://vk.com/al_photos.php',
                    method:'POST',
                    data:'al=1&act=show&photo=' + photoId + '&list=' + listId,
                    headers:[
                        {header:'Content-Type', value:'application/x-www-form-urlencoded'},
                        {header:'X-Requested-With', value:'XMLHttpRequest'}
                    ]},
                function (response) {
                    var photos;
                    try {
                        photos = JSON.parse(response.match(/<!json>(.*?)<!>/)[1]);
                    } catch (e) {
                        return;
                    }
                    for (var i in photos) {
                        if (photos[i].id == photoId) {
                            link.data().hoverZoomSrc = [photos[i].x_src];
                            link.addClass('hoverZoomLink');
                        } else {
                            // in case the request fetched details on another photo on the page
                            var otherLink = $('a[href^="/photo' + photos[i].id + '"]');
                            if (otherLink.length > 0) {
                                otherLink.addClass('hoverZoomLink');
                                otherLink.data().hoverZoomSrc = [photos[i].x_src];
                            }
                        }
                    }
                    if (!link.data().hoverZoomMouseLeft) {
                        hoverZoom.displayPicFromElement(link);
                    }
                });
        }

        $('a[href^="/photo"]').mouseenter(function () {
            var link = $(this), data = link.data();
            if (data.hoverZoomSrc || link.parents('#pv_box').length > 0) {
                return;
            }
            if (this.onclick) {
                var onclick = this.onclick.toString();
                if (onclick.indexOf('x_src:') > -1) {
                    data.hoverZoomSrc = [onclick.match(/x_src\s*:\s*"([^"]*)"/)[1]];
                    link.addClass('hoverZoomLink');
                }
            }
            if (data.hoverZoomSrc || data.hoverZoomRequested) {
                return;
            }
            data.hoverZoomRequested = true;
            var listId, photoId = this.href.match(/\/photo(-?\d+_\d+).*/)[1];
            if (this.href.indexOf('tag=') > -1) {
                listId = 'tag' + this.href.match(/tag=(\d+)/)[1];
            }
            prepareFromPhotoId(link, photoId, listId);
        }).mouseleave(function () {
            $(this).data().hoverZoomMouseLeft = true;
        });

        $('a[onclick*="showPhoto"]').filter(function () {
            return !this.hasAttribute("href");
        }).mouseenter(function () {
            var link = $(this), data = link.data();
            if (data.hoverZoomSrc || data.hoverZoomRequested || link.parents('#pv_box').length > 0) {
                return;
            }
            var matches = link.attr('onclick').match(/'(-?\d+_\d+)',\s*'(.+)'/);
            var photoId = matches[1], listId = matches[2];
            data.hoverZoomRequested = true;
            prepareFromPhotoId(link, photoId, listId);
        }).mouseleave(function () {
            $(this).data().hoverZoomMouseLeft = true;
        });

        $('img[src*="/u"]').filter(function () {
            return this.src.match(/\/u\d+\/[ed]_/);
        }).mouseenter(function () {
            var img = $(this), data = img.data();
            if (data.hoverZoomRequested || data.hoverZoomSrc) {
                return;
            }
            data.hoverZoomRequested = true;
            var userId = this.src.match(/\/u(\d+)\//)[1];
            chrome.runtime.sendMessage({action:'ajaxGet', url:'http://vk.com/al_profile.php?al=1&act=get_profile_photos&offset=0&skip_one=0&id=' + userId}, function (response) {
                var photos;
                try {
                    photos = JSON.parse(response.match(/<!json>(.*)$/)[1]);
                } catch (e) {
                    return;
                }
                if (photos.length) {
                    prepareFromPhotoId(img, photos[0][1].match(/\/photo(\d+_\d+)/)[1], '');
                }
            });
        }).mouseleave(function () {
            $(this).data().hoverZoomMouseLeft = true;
        });

    }
});
