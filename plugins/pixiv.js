var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name: 'Pixiv',
    prepareImgLinks: function (callback) {
        // the element selector
        const selector = {
            thumbnail: 'a[href*="/artworks/"], a[href*="member_illust.php?mode="]',
        }

        /**
         * extract image count from html string 
         * Example : 
         * html string : ...-fzXfOs bAzGJS">25</span></div>...
         * Captures:
         * Group 1 : 25 
         */
        // 
        const imageCountRegex = />(\d+)<\/span/ 
        function getImgCount(containerStr) {
            const match = containerStr.match(imageCountRegex)
            if(match != null) {
                // Parse the String
                return parseInt(match[1])
            }
            return 1
        }

        /**
         * get the date and id from url of thumbnail
         * it will search from html string
         * 
         * Example Urls : https://i.pximg.net/c/150x150/img-master/img/2019/09/19/11/04/57/76858051_p0_master1200.jpg
         * Group 1      : (the date) 2019/09/19/11/04/57
         * Group 3      : (the id) 76858051
         */
        const urlregex = /img-master\/img\/(\d+\/(\d\d\/?(?!\d{3})){5})\/(\d+)_/
        function getData(containerStr) {
            const match = containerStr.match(urlregex)
            if (match != null)
                return {
                    date: match[1],
                    id: match[3]
                }
        }

        /**
         * jQuery one listener
         * only 
         */
        const imageElements = $(selector.thumbnail)
        imageElements.one('mouseover', function () {
            const jcontainer = $(this)

            // stop function if data already bind
            if(jcontainer.data().hoverZoomGallerySrc) return;
            const containerString = this.outerHTML
            
            const data = getData(containerString)
            // abort if the data not found
            if(!data) return

            // get the image count
            const imageCount = getImgCount(containerString)
            const galleryUrls = []

            // Loop through image number
            for (let i = 0; i < imageCount; i++) {
                const url = {
                    original: `https://i.pximg.net/img-original/img/${data.date}/${data.id}_p${i}.jpg`,
                    regular: `https://i.pximg.net/img-master/img/${data.date}/${data.id}_p${i}_master1200.jpg`
                }
                const urls = [url.regular]
                
                /** 
                 * unshift original value if options showHighRes is true
                 * so its loaded first
                */
                if(options.showHighRes) {
                    urls.unshift(url.original)
                }
                galleryUrls.push(urls)
            }
            jcontainer.data('hoverZoomGallerySrc', galleryUrls)
            callback($([jcontainer]))
        })
    }
});