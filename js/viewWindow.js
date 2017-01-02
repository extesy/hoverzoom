var popupBorder = { width: window.outerWidth - window.innerWidth, height: window.outerHeight - window.innerHeight };
browser.runtime.sendMessage({action:'setItem', id:'popupBorder', data:JSON.stringify(popupBorder)});

browser.runtime.sendMessage({action:'getOptions'}, function (options) {
    window.addEventListener('keydown', function (event) {
        if (event.which == options.openImageInWindowKey) {
            window.close();
        }
    });
});