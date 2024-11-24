var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'VK.com',
    version:'1.4',
    prepareImgLinks:function (callback) {

        const res = [];

        $('div[data-task-click="WallPost/openPhoto"], a[data-task-click="WallPost/openPhoto"], a.page_post_thumb_wrap').each(function () {
            let link = $(this), data = this.getAttribute('data-options');
            if (!data)
                data = this.getAttribute('onclick');
            if (!data)
                return;
            //parse onclick function body in order to extract alternative images urls
            const index1 = data.indexOf('{');
            const index2 = data.lastIndexOf('}');
            const json = data.substring(index1, index2 + 1);
            if (json) {
                let url = "";
                try {
                    const j = JSON.parse(json);
                    const jj = j.base === undefined || j.base === "" ? j.temp : j.base;
                    if (jj.w) url = jj.w;
                    else if (jj.z) url = jj.z;
                    else if (jj.y) url = jj.y;
                    else if (jj.x) url = jj.x;

                    link.data().hoverZoomSrc = [url];
                    res.push(link);
                } catch(e) {}
            }
        });

        callback($(res), this.name);
    }
});
