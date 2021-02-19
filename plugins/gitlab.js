var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'gitlab',
    version:'0.1',
    prepareImgLinks:function (callback) {
        var res = [];

        // sample: https://assets.gitlab-static.net/uploads/-/system/user/avatar/6194630/avatar.png?width=40
        //      -> https://assets.gitlab-static.net/uploads/-/system/user/avatar/6194630/avatar.png
        hoverZoom.urlReplace(res,
            //'img[src],[style]',
            'img[src]',
            /\?width.*/,
            ''
        );

        // sample: https://gitlab.com/gitlab-com/www-gitlab-com/-/blob/master/sites/marketing/source/images/team/pets/Alfred.jpg
        //      -> https://gitlab.com/gitlab-com/www-gitlab-com/-/raw/master/sites/marketing/source/images/team/pets/Alfred.jpg
        hoverZoom.urlReplace(res,
            'a[href]',
            /\/blob\//,
            '/raw/'
        );

        $('image').each(function() {
            var _this = $(this), data = _this.data();
            if (this.href == null) return;
            if (this.href.baseVal == null) return;
            let href = this.href.baseVal;
            // gravatar
            if (href.indexOf('gravatar') != -1) {
                if (href.indexOf('?') == -1) {
                    href = href + '?s=512';
                } else if (href.indexOf('s=') > -1) {
                    href = href.replace(/s=\d+/, 's=512');
                } else {
                    href = href + '&s=512';
                }
            }
            // gitlab
            if (href.indexOf('gitlab') != -1) {
                href = href.replace(/\?width.*/, '');
            }

            data.hoverZoomSrc = [href];
            res.push(_this);
        });

        if (res.length) {
            callback($(res), this.name);
        }
    }
});
