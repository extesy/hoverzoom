var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'VK.com',
    version:'1.2',
    prepareImgLinks:function (callback) {

        var res = [];
        var link;

        //parse onclick function bodys in order to extract alternative images urls
        function findUrl(id) {

            $('a[data-photo-id=' + id + ']').each(function () {
                var onclick = this.getAttribute('onclick') || "";
                var index1 = onclick.indexOf('{');
                var index2 = onclick.lastIndexOf('}');
                var json = onclick.substring(index1, index2 + 1);
                if (json) {
                    try {
                        j = JSON.parse(json);
                        if (j.base == undefined || j.base == "") { jj = j.temp; }
                        else { jj = j.base; }
                        /*base = j.base;
                        x = "";
                        x_ = j.x_;
                        if (x_) { x = x_[0]; if (x) { if (!x.startsWith('http')) { if (base) { x = base + x }} }}
                        y = "";
                        y_ = j.y_;
                        if (y_) { y = y_[0]; if (y) { if (!y.startsWith('http')) { if (base) { y = base + y }} }}
                        z = "";
                        z_ = j.z_;
                        if (z_) { z = z_[0]; if (z) { if (!z.startsWith('http')) { if (base) { z = base + z }} }}
                        w = "";
                        w_ = j.w_;
                        if (w_) { w = w_[0]; if (w) { if (!w.startsWith('http')) { if (base) { w = base + w }} }}*/
                        var url = "";
                        if (jj.w) url = jj.w;
                        else if (jj.z) url = jj.z;
                        else if (jj.y) url = jj.y;
                        else if (jj.x) url = jj.x;

                        link.data().hoverZoomSrc = [url];
                        res.push(link);
                        return false;

                    } catch(e) {}
                }

            });
        }

        $('a[onclick*=showPhoto]').each(function () {
            var link = $(this), onclick = this.getAttribute('onclick');
            var url = "";
            //parse onclick function body in order to extract alternative images urls
            var index1 = onclick.indexOf('{');
            var index2 = onclick.lastIndexOf('}');
            var json = onclick.substring(index1, index2 + 1);
            if (json) {
                try {
                    j = JSON.parse(json);
                    if (j.base == undefined || j.base == "") { jj = j.temp; }
                    else { jj = j.base; }
                    /*base = j.base;
                    x = "";
                    x_ = j.x_;
                    if (x_) { x = x_[0]; if (x) { if (!x.startsWith('http')) { if (base) { x = base + x }} }}
                    y = "";
                    y_ = j.y_;
                    if (y_) { y = y_[0]; if (y) { if (!y.startsWith('http')) { if (base) { y = base + y }} }}
                    z = "";
                    z_ = j.z_;
                    if (z_) { z = z_[0]; if (z) { if (!z.startsWith('http')) { if (base) { z = base + z }} }}
                    w = "";
                    w_ = j.w_;
                    if (w_) { w = w_[0]; if (w) { if (!w.startsWith('http')) { if (base) { w = base + w }} }}*/
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
