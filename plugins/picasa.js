// The dynamic loading of images in Picasa Web Albums makes it difficult to handle with this extension.
// The function that "prepares" a link has been isolated (prepareImgLink) and is called whenever the
// user move the mouse over a link.

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Picasa Web Albums',
    version:'0.6',
    prepareImgLinks:function (callback) {

        function prepareImgLink() {
            var _this = $(this), data = _this.data();
            if (data.hoverZoomSrc) {
                return;
            }
            var src = _this.find('img')[0].src;
            src = src.replace(/\/s\d+(-c)?\//, options.showHighRes ? '/s0/' : '/s800/');
            data.hoverZoomSrc = [src];
            _this.addClass('hoverZoomLink');

            var tooltip = _this.parent().find('.goog-icon-list-icon-meta:eq(0)');
            if (tooltip.length) {
                data.hoverZoomCaption = tooltip.text();
            }
        }

        function bindLinks() {
            $('a.goog-icon-list-icon-link,div.gphoto-grid-cell a').mouseover(prepareImgLink);
            bindLinksTimeout = null;
        }

        var bindLinksTimeout = setTimeout(bindLinks, 500);

        function windowOnDOMNodeInserted(event) {
            if (!bindLinksTimeout && event.srcElement && event.srcElement.nodeName == 'A') {
                bindLinksTimeout = setTimeout(bindLinks, 500);
            }
        }

        $(window).bind('DOMNodeInserted', windowOnDOMNodeInserted)
    }
});
