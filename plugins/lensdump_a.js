var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'lensdump_a',
    version:'1.0',
    prepareImgLinks:function (callback) {
        const pluginName = this.name;

        // sample: https://lensdump.com/i/dHJ6Rb -> https://b.l3n.co/i/dHJ6Rb.png
        // sample: https://lensdump.com/i/dHJdu0 -> https://c.l3n.co/i/dHJdu0.png
        // to know the CDN URL you have to fetch the lensdump page and look at
        // <link rel="image_src"> in the <head>.  Or you could fetch
        // https://lensdump.com/oembed/?url=https%3A%2F%2Flensdump.com%2Fi%2FdHJdu0&format=json
        // and then look at the 'url' property

        $('a[href*="//lensdump.com/i"]').each(function() {
            const link = $(this), data = link.data(), href = link.attr('href');
            const lensdump_metadata_url = 'https://lensdump.com/oembed/?url=' + encodeURIComponent(href) + '&format=json';
            $.ajax(lensdump_metadata_url).done(function (lensdump) {
                if (lensdump.url) {
                    // sometimes the URL is a thumbnail (.md.png or .th.png) instead of full image URL
                    const url = lensdump.url.replace('.md', '').replace('.th', '');
                    data.hoverZoomSrc = [url];
                    callback($([link]), pluginName);
                }
            });
        });
    }
});
