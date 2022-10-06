var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
  name: 'homeexchange',
  version: '0.1',
  prepareImgLinks: (callback) => {
    let res = [];

    // Example URLs:
    //    https://image.homeexchange.fr/images/home/3694222/1887472/1698493326865718.jpg?quality=80&keep-ratio=true
    //    https://image.homeexchange.fr/images/home/3694222/1887472/1698493326865718.jpg?quality=80&width=400&height=225&keep-ratio=true
    //    https://image.homeexchange.fr/images/user/3694222/1697120275924469.jpg?quality=80&smart-resize=true&keep-ratio=true
    //    https://image.homeexchange.fr/images/home/2859575/1483460/1719250638093108.jpg?quality=90&height=1100&keep-ratio=true
    hoverZoom.urlReplace(
      res,
      'a[data-picture*="image.homeexchange"]',
      /\?.[^"]*/,
      '?quality=100&height=800&smart-resize=true&smart-resize=true'
    );

    hoverZoom.urlReplace(
      res,
      '[data-bg*="image.homeexchange"]',
      /\?.[^"]*/,
      '?quality=100&height=800&smart-resize=true&smart-resize=true'
    );

    hoverZoom.urlReplace(
      res,
      'img[src*="image.homeexchange"]',
      /\?.[^"]*/,
      '?quality=100&width=500&height=500&smart-resize=true&smart-resize=true'
    );

    hoverZoom.urlReplace(
      res,
      '.user-image[style*="image.homeexchange"]',
      /\?.[^"]*/,
      '?quality=100&width=500&height=500&smart-resize=true&smart-resize=true'
    );

    callback($(res));
  },
});
