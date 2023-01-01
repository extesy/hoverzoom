var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'VK.com',
    version:'1.3',
    prepareImgLinks:function (callback) {

        var res = [];
        var link;

        $('[data-task-click="WallPost/openPhoto"]').each(function () {
            var link = $(this), data = this.getAttribute('data-options');
            var url = "";
            //parse onclick function body in order to extract alternative images urls
            var index1 = data.indexOf('{');
            var index2 = data.lastIndexOf('}');
            var json = data.substring(index1, index2 + 1);
            if (json) {
                try {
                    j = JSON.parse(json);
                    if (j.base == undefined || j.base == "") { jj = j.temp; }
                    else { jj = j.base; }
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
