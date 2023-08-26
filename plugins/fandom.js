var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'fandom',
    version:'0.1',
    prepareImgLinks:function (callback) {
        // Images

        // sample: https://static.wikia.nocookie.net/supernaturalpowers/images/3/34/%EB%A7%88%EB%B8%94_%EC%9D%B4%ED%84%B0%EB%8B%88%ED%8B%B0.jpg/revision/latest/zoom-crop/width/500/height/500?cb=20190426134645&path-prefix=ko
        //   full: https://static.wikia.nocookie.net/supernaturalpowers/images/3/34/%EB%A7%88%EB%B8%94_%EC%9D%B4%ED%84%B0%EB%8B%88%ED%8B%B0.jpg/revision/latest/?cb=20190426134645&path-prefix=ko

        $('img[src*="nocookie"], div[src*="nocookie"], a[href*="nocookie"]').one('mouseover', function() {
            let link = $(this);
            const src = this.src || this.href;
            const fullsize = src.replace(/\/(zoom|scale|smart|thumbnail)([^?]+)(.*)/, '$3');
            link.data().hoverZoomSrc = [fullsize];
            link.addClass('hoverZoomLink');
            hoverZoom.displayPicFromElement(link);
        });

        $('[style*=url]').filter(function() { return !(/\/poster\.jpg/.test(this.style.backgroundImage)) }).one('mouseover', function() {
            let link = $(this);
            // extract url from style
            let backgroundImage = this.style.backgroundImage;
            const reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            // remove leading & trailing quotes
            const src = backgroundImage.replace(/^['"]/, "").replace(/['"]+$/, "");
            const fullsize = src.replace(/\/(zoom|scale|smart|thumbnail)([^?]+)(.*)/, '$3');
            link.data().hoverZoomSrc = [fullsize];
            link.addClass('hoverZoomLink');
            hoverZoom.displayPicFromElement(link);
        });

        // Videos

        //   sample: https://www.fandom.com/video/t7eezF6p/honest-game-trailers-valheim
        // playlist: https://cdn.jwplayer.com/manifests/t7eezF6p.m3u8

        $('a[href*="/video/"]').one('mouseover', function() {
            let link = $(this);
            const href = this.href;
            const re = /\/video\/(.*?)\//;
            const m = href.match(re);
            if (m == null) return;
            const videoId = m[1];
            const videoUrl = `https://cdn.jwplayer.com/manifests/${videoId}.m3u8`;
            link.data().hoverZoomSrc = [videoUrl];
            link.addClass('hoverZoomLink');
            hoverZoom.displayPicFromElement(link);
        });

        $('div[data-video-id]').one('mouseover', function() {
            let link = $(this);
            const videoId = this.dataset.videoId;
            const videoUrl = `https://cdn.jwplayer.com/manifests/${videoId}.m3u8`;
            link.data().hoverZoomSrc = [videoUrl];
            link.addClass('hoverZoomLink');
            hoverZoom.displayPicFromElement(link);
        });

        $('[style*=url]').filter(function() { return (/\/poster\.jpg/.test(this.style.backgroundImage)) }).one('mouseover', function() {
            let link = $(this);
            // extract url from style
            let backgroundImage = this.style.backgroundImage;
            const reUrl = /.*url\s*\(\s*(.*)\s*\).*/i
            backgroundImage = backgroundImage.replace(reUrl, '$1');
            // remove leading & trailing quotes
            const src = backgroundImage.replace(/^['"]/, "").replace(/['"]+$/, "");
            const re = /\/([^\/]+)\/poster/
            const m = src.match(re);
            if (m == null) return;
            const videoId = m[1];
            const videoUrl = `https://cdn.jwplayer.com/manifests/${videoId}.m3u8`;
            link.data().hoverZoomSrc = [videoUrl];
            link.addClass('hoverZoomLink');
            hoverZoom.displayPicFromElement(link);
        });
    }
});
