var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Instagram',
    prepareImgLinks:function (callback) {
        $('body').on('mouseenter', 'a[href*="?taken-by"]', function () {
            var link = $(this);
            if (link.hasClass('hoverZoomLink'))
                return;
            if (link.find('span.coreSpriteSidecarIconLarge').length === 0) {
                link.data().hoverZoomSrc = [link.prop('href').replace(/[?]taken-by=.*$/, 'media?size=l')];
                link.addClass('hoverZoomLink');
                hoverZoom.displayPicFromElement(link);
            } else {
                hoverZoom.prepareFromDocument(link, link.attr('href'), function(doc) {
                    var img = [];
                    doc.querySelectorAll('script').forEach(script => {
                        var body = script.innerHTML;
                        if (!body.startsWith('window._sharedData')) return;
                        var json = JSON.parse(body.slice(20, -1));
                        var edges = json.entry_data.PostPage["0"].graphql.shortcode_media.edge_sidecar_to_children.edges;
                        edges.forEach(edge => img.push([edge.node.display_url]));
                    });
                    return img.length > 0 ? img : false;
                });
            }
        });
    }
});
