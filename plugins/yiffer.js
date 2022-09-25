var hoverZoomPlugins = hoverZoomPlugins ?? [];
hoverZoomPlugins.push({
  name: "yiffer",
  version: "0.1",
  prepareImgLinks(callback) {
    const result = Array.from(document.querySelectorAll(".comic-page")).map(
      (img) => {
        $(img).data().hoverZoomSrc = [img.src];
        return $(img);
      }
    );

    const comicCards = Array.from(document.querySelectorAll(".comic-card"))
      .filter((div) => {
        const isAd = div.querySelector(".paidImageTextContainer") !== null;
        return !isAd;
      })
      .map((div) => {
        const numberOfPagesElement = div.querySelector(
          "p[title='Number of pages']"
        );
        const numberOfPages = Number.parseInt(
          numberOfPagesElement.innerText,
          10
        );
        const comicId = div.firstChild.getAttribute("href").slice(1);

        const img = div.querySelector(".imgContainer img");
        $(img).data().hoverZoomSrc = [];
        $(img).data().hoverZoomGallerySrc = Array(numberOfPages)
          .fill(1)
          .map((_, i) => {
            const paddedPageNumber = String(i + 1).padStart(3, "0");
            return [
              `https://static.yiffer.xyz/comics/${comicId}/${paddedPageNumber}.jpg`,
            ];
          });

        return $(img);
      });

    result.push(...comicCards);

    callback($(result), this.name);
  },
});
