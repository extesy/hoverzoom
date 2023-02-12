let popupBorder = {width: window.outerWidth - window.innerWidth, height: window.outerHeight - window.innerHeight};
chrome.runtime.sendMessage({action:'setItem', id:'popupBorder', data:JSON.stringify(popupBorder)});

chrome.runtime.sendMessage({action:'getOptions'}, function (options) {
    window.addEventListener('keydown', function (event) {
        if (event.which === options.openImageInWindowKey) {
            window.close();
        }
    });
});

// one and only one image should be displayed
if (document.images.length === 1 || document.querySelector('video')) {
    let naturalWidth = document.images[0].naturalWidth;
    let naturalHeight = document.images[0].naturalHeight;

    // resize a window according to image dimensionsw
    popupBorder = {width: 16, height: 38};
    let updateData = {};

    updateData.width = naturalWidth + popupBorder.width;
    updateData.height = naturalHeight + popupBorder.height;

    // if the image is bigger than screen, adjust window dimensions to match the image aspect ratio
    if (updateData.height > screen.availHeight) {
        updateData.height = screen.availHeight;
        updateData.width = Math.round(popupBorder.width + (screen.availHeight - popupBorder.height) * naturalWidth / naturalHeight);
    }
    if (updateData.width > screen.availWidth) {
        updateData.width = screen.availWidth;
        updateData.height = Math.round(popupBorder.height + (screen.availWidth - popupBorder.width) * naturalHeight / naturalWidth);
    }

    // center window
    updateData.top = Math.round(screen.availHeight / 2 - updateData.height / 2);
    updateData.left = Math.round(screen.availWidth / 2 - updateData.width / 2);

    // update a window only if needed
    if (updateData.width !== window.outerWidth || updateData.height !== window.outerHeight || updateData.top !== window.screenTop || updateData.left !== window.screenLeft) {
        chrome.runtime.sendMessage({action:'updateViewWindow', updateData:updateData});
    }
} else {
    window.close();
}
