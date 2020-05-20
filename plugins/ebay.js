var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'eBay',
    version:'0.5',
    prepareImgLinks:function (callback) {
        var res = [];
        var appId = 'RomainVa-3007-4951-b943-aaedf0d9af84';
        var requestUrlBase = 'http://open.api.ebay.com/shopping?appid=' + appId + '&version=687&siteid=0&callname=GetMultipleItems&responseencoding=JSON&ItemID=';
        var itemIndex = 0;
        var hzItems = [], itemIds = [];

        hoverZoom.urlReplace(res,
            'img[src]',
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
            if (item.id) {
                itemIds.push(item.id);
                hzItems.push(item);
            }
        });
        
        // Then we make calls to the eBay API to get details on the items
        // using the IDs we found
        function getItems() {

            // Each call can get a maximum number of 20 items, so we have to iterate
            var indexEnd = Math.min(itemIndex + 20, itemIds.length);
            var itemBunch = itemIds.slice(itemIndex, indexEnd);
            itemIndex = indexEnd;
            var requestUrl = requestUrlBase + itemBunch.join(',');
           
            // Ajax calls are made through the background page (not possible from a content script)
            chrome.runtime.sendMessage({action:'ajaxGet', url:requestUrl}, function (data) {
                
                var getMultipleItemsResponse = JSON.parse(data);
                if (getMultipleItemsResponse.Errors)
                    return;
                for (var i = 0; i < getMultipleItemsResponse.Item.length; i++) {
                    var item = getMultipleItemsResponse.Item[i];
                    
                    for (var j = 0; j < hzItems.length; j++) {
                        if (hzItems[j].id == item.ItemID && item.PictureURL && item.PictureURL.length > 0) {
                            var thumb = $(hzItems[j].thumb), data = thumb.data();
                            if (item.PictureURL.length == 1) {
                                var url = item.PictureURL[0];
                                data.hoverZoomSrc = [url];
                                data.hoverZoomCaption = item.Title;
                            } else {
                                data.hoverZoomGallerySrc = [];
                                data.hoverZoomGalleryCaption = [];
                                for (var k = 0; k < item.PictureURL.length; k++) {
                                    var url = item.PictureURL[k];
                                    data.hoverZoomGallerySrc.push([url]);
                                    data.hoverZoomGalleryCaption.push(item.Title);
                                }
                            }
                            
                            res.push(thumb);

                            // Items are stored to lessen API calls
                            //localStorage[cachePrefix + item.ItemID] = JSON.stringify({pictureUrl:url, title:item.Title});
                        }
                    }
                }
                callback($(res), this.name);
                res = [];
                if (itemIndex < itemIds.length) {
                    // Continue with the next 20 items
                    getItems();
                }
            });
        }

        if (hzItems.length > 0) {
            getItems();
        }
    }
});
