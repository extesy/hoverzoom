var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'eBay',
    version:'0.6',
    prepareImgLinks:function (callback) {
        var res = [];
        var hzItems = [], itemIds = [];

        // sample: https://i.ebayimg.com/00/s/NjgzWDEwMjQ=/z/oIAAAOSw2xRYhceC/$_2.JPG
        //      -> https://i.ebayimg.com/00/s/NjgzWDEwMjQ=/z/oIAAAOSw2xRYhceC/$_32.JPG
        hoverZoom.urlReplace(res,
            'img[src*="ebayimg"],[style*="ebayimg"]',
            /\$_\d+/,
            '$_32'
        );

        // sample: https://i.ebayimg.com/images/g/SDwAAOSw9vdgOLBv/s-l500.jpg
        //      -> https://i.ebayimg.com/images/g/SDwAAOSw9vdgOLBv/s-l1600.jpg
        hoverZoom.urlReplace(res,
            'img[src*="ebayimg"],[style*="ebayimg"]',
            /\/s-l\d+\./,
            '/s-l1600.'
        );

        callback($(res), this.name);

        function getIdFromURL(url) {
            if (!url) {
                return false;
            }
            var reg = url.match(/\d{9,12}/);
            if (!reg) {
                return false;
            }
            return reg[0];
        }

        // First we gather all the products on the page and we store their eBay ID and
        // the link that will receive the 'hoverZoomSrc' data.
        $('div[itemscope] img[src*="i.ebayimg.com"]').each(function () {
            var img = $(this);
            var item = { thumb: this, id: '' },
                link = img.parents('div[itemscope]');
            item.id = getIdFromURL(link.data('href'));
            item.thumb = link;
            if (item.id) {
                itemIds.push(item.id);
                hzItems.push(item);
            }
        });
        
        $('a img[src*="i.ebayimg.com"], a img[src*="thumbs.ebaystatic.com"]').each(function () {
            var img = $(this);
            var item = { thumb: this, id: '' },
                link = img.parents('a');
            item.id = getIdFromURL(link.attr('href'));
            item.thumb = link;
            if (item.id) {
                itemIds.push(item.id);
                hzItems.push(item);
            }
        });
        
        // Then we make calls to the eBay API to get details on the items
        // using the IDs we found
        function getItems() {
            itemIds.forEach((itemId) => {
                var requestUrl = 'https://www.ebay.com/pi/layer/' + itemId;
                // Ajax calls are made through the background page (not possible from a content script)
                chrome.runtime.sendMessage({action: 'ajaxGet', url: requestUrl}, function (data) {
                    var res = [];
                    var response = JSON.parse(data);
                    if (!response.gallery)
                        return;

                    for (const hzItem of hzItems) {
                        if (hzItem.id === itemId) {
                            var thumb = $(hzItem.thumb), data = thumb.data(), pics = response.gallery.pictures;
                            cLog(pics);
                            if (pics.length == 1) {
                                data.hoverZoomSrc = [pics[0].mainImgUrl.replace(/\/s-l\d+\./, '/s-l1600.')];
                                data.hoverZoomCaption = pics[0].imgAccessibility;
                            } else {
                                data.hoverZoomGallerySrc = [];
                                data.hoverZoomGalleryCaption = [];
                                for (const pic of pics) {
                                    data.hoverZoomGallerySrc.push([pic.mainImgUrl.replace(/\/s-l\d+\./, '/s-l1600.')]);
                                    data.hoverZoomGalleryCaption.push(pic.imgAccessibility);
                                }
                            }

                            res.push(thumb);

                            // Items are stored to lessen API calls
                            //localStorage[cachePrefix + item.ItemID] = JSON.stringify({pictureUrl:url, title:item.Title});
                        }
                    }

                    callback($(res), this.name);
                });
            });
        }

        if (hzItems.length > 0) {
            getItems();
        }
    }
});
