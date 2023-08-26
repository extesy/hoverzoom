var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
  name: 'homeexchange',
  version: '0.2',
  prepareImgLinks: (callback) => {
    let res = [];
    const re = /\?.[^"]*/;
    const patch = '?quality=100&height=1080&width=1080';

    // Example URLs:
    //    https://image.homeexchange.fr/images/home/3694222/1887472/1698493326865718.jpg?quality=80&keep-ratio=true
    //    https://image.homeexchange.fr/images/home/3694222/1887472/1698493326865718.jpg?quality=80&width=400&height=225&keep-ratio=true
    //    https://image.homeexchange.fr/images/user/3694222/1697120275924469.jpg?quality=80&smart-resize=true&keep-ratio=true
    //    https://image.homeexchange.fr/images/home/2859575/1483460/1719250638093108.jpg?quality=90&height=1100&keep-ratio=true
    hoverZoom.urlReplace(
      res,
      'a[data-picture*="/images/home/"], a[data-picture*="/images/user/"]',
      re,
      patch
    );

    hoverZoom.urlReplace(
      res,
      '[data-bg*="/images/home/"], [data-bg*="/images/user/"]',
      re,
      patch
    );

    hoverZoom.urlReplace(
      res,
      'img[src*="/images/home/"], img[src*="/images/user/"]',
      re,
      patch
    );

    hoverZoom.urlReplace(
      res,
      '.user-image[style*="/images/home/"], .user-image[style*="/images/user/"]',
      re,
      patch
    );

    hoverZoom.urlReplace(
      res,
      'div[style*="/images/home/"], div[style*="/images/user/"]',
      re,
      patch
    );

    callback($(res), this.name);
  },
});
