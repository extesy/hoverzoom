var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'Fab',
    version:'0.3',
    // listing uid -> promise of the listing API response; kept across prepareImgLinks calls
    listings:{},
    prepareImgLinks:function (callback) {
        const name = this.name;

        // Every size of a Fab image has its own random file name, e.g. for one image:
        //   https://media.fab.com/image_previews/gallery_images/<folder>/f8d820ac-....jpg (640x360)
        //   https://media.fab.com/image_previews/gallery_images/<folder>/e6f0acf9-....jpg (original)
        // so the full-size URL cannot be derived from the thumbnail URL.
        // The listing API returns every size of each image together with the original:
        //   https://www.fab.com/i/listings/<listing uid>
        //   -> thumbnails[] / medias[] : { images: [{ url, width, height }, ...], mediaUrl }
        const reListing = /\/listings\/([0-9a-f-]{36})/i;

        const listings = this.listings;

        // same-origin API call: cookies are sent, no background page needed
        async function getListing(id) {
            if (!listings[id]) {
                listings[id] = fetch('/i/listings/' + id, { credentials: 'include' })
                    .then(response => response.ok ? response.json() : null)
                    .catch(() => null);
            }
            return listings[id];
        }

        // listing uids to try for an image: the card around it, then the listing page itself
        function getListingIds(img) {
            const ids = [];
            // the nearest ancestor with listing links is the card only if they all point to one listing
            // (around a listing page's gallery it is the whole page, full of recommendations)
            for (let el = img.parentElement; el && el !== document.body; el = el.parentElement) {
                const links = el.querySelectorAll('a[href*="/listings/"]');
                if (links.length === 0) continue;
                const cardIds = [];
                for (const link of links) {
                    const m = link.getAttribute('href').match(reListing);
                    if (m && cardIds.indexOf(m[1]) === -1) cardIds.push(m[1]);
                }
                if (cardIds.length === 1) ids.push(cardIds[0]);
                break;
            }
            const m = location.pathname.match(reListing);
            if (m && ids.indexOf(m[1]) === -1) ids.push(m[1]);
            return ids;
        }

        // the original of the media that has src among its sizes
        function findOriginal(listing, src) {
            if (!listing) return null;
            const medias = [].concat(listing.thumbnails || [], listing.medias || []);
            for (const media of medias) {
                const images = media.images || [];
                if (!images.some(image => image.url === src)) continue;
                if (media.mediaUrl) return media.mediaUrl;
                // no original: take the widest size
                return images.reduce((a, b) => (b.width || 0) > (a.width || 0) ? b : a).url;
            }
            return null;
        }

        async function resolve(img) {
            for (const id of getListingIds(img)) {
                const url = findOriginal(await getListing(id), img.src);
                if (url) return url;
            }
            return null;
        }

        // On hover Fab puts a link overlay (a.fabkit-Thumbnail-overlay) next to the <img>, and the cursor is then
        // on the overlay, not on the image: the hover target is the thumbnail box around both.
        // Fab keeps the box but swaps the image inside it, so the image is looked up again on every hover.
        const selector = 'img[src*="media.fab.com/image_previews/"]';
        $(selector).each(function () {
            const box = this.closest('.fabkit-Thumbnail-root') || this;
            // the core skips a .hoverZoomLink without hoverZoomSrc, so the class can be set before the lookup
            if (box.classList.contains('hoverZoomLink')) return;
            box.classList.add('hoverZoomLink');
            const link = $(box);
            link.on('mouseover', function () {
                const img = box.matches(selector) ? box : box.querySelector(selector);
                const data = link.data();
                if (!img || data.hoverZoomFabSrc === img.src) return;
                const src = img.src;
                data.hoverZoomFabSrc = src;
                delete data.hoverZoomSrc;
                resolve(img).then(fullsizeUrl => {
                    if (!fullsizeUrl || fullsizeUrl === src || data.hoverZoomFabSrc !== src) return;
                    data.hoverZoomSrc = [fullsizeUrl];
                    callback(link, name);
                    hoverZoom.displayPicFromElement(link);
                });
            });
        });

        callback($([]), name);
    }
});
