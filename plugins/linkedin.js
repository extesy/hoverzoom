var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
    name:'LinkedIn',
    version:'0.3',
    prepareImgLinks:function (callback) {

        var JSESSIONIDCookie = getCookie("JSESSIONID").replace(/"/g, '');

        // individuals
        $('a[href*="/in/"]:not([href*="/detail/"]):not(.hoverZoomMouseover)').addClass('hoverZoomMouseover').one('mouseover', function () {
            var link = $(this);
            fetchProfile(link, 'href');
        });

        // companies
        $('a[href*="/company/"]:not(.hoverZoomMouseover)').addClass('hoverZoomMouseover').one('mouseover', function () {
            var link = $(this);
            fetchCompany(link, 'href');
        });

        // parse url to extract company's id then call API to find url of fullsize company photo
        // NB: API can not be called using company name, we need its id
        function fetchCompany(link, attr) {

            let url = link.prop(attr);
            let companyId = null;

            // sample: https://www.linkedin.com/company/1951
            // => companyId = 1951
            let regexCompanyId = /\/company\/([0-9]{2,})/;
            let matchesCompanyId = url.match(regexCompanyId);
            if (matchesCompanyId) companyId = matchesCompanyId.length > 1 ? matchesCompanyId[1] : null;

            if (companyId == null) {
                // sample: https://www.linkedin.com/company/celsius-therapeutics/?miniCompanyUrn=urn%3Ali%3Afs_miniCompany%3A28591021
                // => companyId = 28591021
                let regexCompanyId = /\/company\/.*%3A([0-9]{2,})/;
                let matchesCompanyId = url.match(regexCompanyId);
                if (matchesCompanyId) companyId = matchesCompanyId.length > 1 ? matchesCompanyId[1] : null;
            }

            if (companyId == null) return;

            let storedUrl = null;
            let storedCaption = null;
            // check sessionStorage in case fullsize url was already found
            if (companyId) {
                storedUrl = sessionStorage.getItem(companyId + "_url");
                storedCaption = sessionStorage.getItem(companyId + "_caption");
            }

            if (storedUrl == null) {

                // call Linkedin API
                $.ajax({
                    type: "GET",
                    dataType: 'text',
                    beforeSend: function(request) {
                        request.setRequestHeader("csrf-token", JSESSIONIDCookie);
                    },
                    url: "https://www.linkedin.com/voyager/api/entities/companies/" + companyId,
                    success: function(response) { extractCompanyPhoto(link, companyId, response); },
                    error: function(response) { }
                });

            } else {
                let data = link.data();
                if (data.hoverZoomSrc == undefined) {
                    data.hoverZoomSrc = [];
                }
                data.hoverZoomSrc.unshift(storedUrl);
                data.hoverZoomCaption = storedCaption;
                res.push(link);
                callback(link, name);
            }
        }

        // parse url to extract profile's name then call API to find url of fullsize profile photo
        function fetchProfile(link, attr) {

            let url = link.prop(attr);

            // sample: https://www.linkedin.com/in/williamhgates/
            // => profileName = williamhgates
            // sample: https://www.linkedin.com/in/bertranddesmier?miniProfileUrn=urn%3Ali%3Afs_miniProfile%3AACoAAAE1RYkBGL--8b3ox_rRCqx51SuSn_l1-FY
            // => profileName = bertranddesmier
            let regexProfileName = /\/in\/([^\/\?]{1,})/;
            let matchesProfileName = url.match(regexProfileName);
            let profileName = null;
            if (matchesProfileName) profileName = matchesProfileName.length > 1 ? matchesProfileName[1] : null;

            if (profileName == null) return;

            let storedUrl = null;
            let storedCaption = null;
            // check sessionStorage in case fullsize url was already found
            if (profileName) {
                storedUrl = sessionStorage.getItem(profileName + "_url");
                storedCaption = sessionStorage.getItem(profileName + "_caption");
            }

            if (storedUrl == null) {

                // call Linkedin API
                $.ajax({
                    type: "GET",
                    dataType: 'text',
                    beforeSend: function(request) {
                        request.setRequestHeader("csrf-token", JSESSIONIDCookie);
                    },
                    url: "https://www.linkedin.com/voyager/api/identity/profiles/" + profileName,
                    success: function(response) { extractProfilePhoto(link, profileName, response); },
                    error: function(response) { }
                });

            } else {
                let data = link.data();
                if (data.hoverZoomSrc == undefined) {
                    data.hoverZoomSrc = [];
                }
                data.hoverZoomSrc.unshift(storedUrl);
                data.hoverZoomCaption = storedCaption;
                res.push(link);

                callback(link, name);
            }
        }

        function extractCompanyPhoto(link, companyId, response)  {

            try {
                let j = JSON.parse(response);
                let rootUrl = j.basicCompanyInfo.miniCompany.logo["com.linkedin.common.VectorImage"].rootUrl;
                let nbPictures = j.basicCompanyInfo.miniCompany.logo["com.linkedin.common.VectorImage"].artifacts.length;
                let largestPicture = j.basicCompanyInfo.miniCompany.logo["com.linkedin.common.VectorImage"].artifacts[nbPictures - 1].fileIdentifyingUrlPathSegment;
                let fullsizeUrl = rootUrl + largestPicture;
                let caption = j.basicCompanyInfo.miniCompany.name;

                let data = link.data();
                if (data.hoverZoomSrc == undefined) {
                    data.hoverZoomSrc = [];
                }
                data.hoverZoomSrc.unshift(fullsizeUrl);
                data.hoverZoomCaption = caption;

                // store url & caption
                sessionStorage.setItem(companyId + "_url", fullsizeUrl);
                sessionStorage.setItem(companyId + "_caption", caption);
                callback(link, name);
                hoverZoom.displayPicFromElement(link);

            } catch {}

        }

        function extractProfilePhoto(link, profileName, response)  {

            try {
                let j = JSON.parse(response);
                let rootUrl = j.miniProfile.picture["com.linkedin.common.VectorImage"].rootUrl;
                let artifacts = j.miniProfile.picture["com.linkedin.common.VectorImage"].artifacts;
                artifacts.sort((a, b) => b.width - a.width);
                let largestPicture = artifacts[0].fileIdentifyingUrlPathSegment;
                let fullsizeUrl = rootUrl + largestPicture;
                let caption = j.firstName + " " + j.lastName + " - " + j.headline;

                let data = link.data();
                if (data.hoverZoomSrc == undefined) {
                    data.hoverZoomSrc = [];
                }
                data.hoverZoomSrc.unshift(fullsizeUrl);
                data.hoverZoomCaption = caption;

                // store url & caption
                sessionStorage.setItem(profileName + "_url", fullsizeUrl);
                sessionStorage.setItem(profileName + "_caption", caption);
                callback(link, name);
                hoverZoom.displayPicFromElement(link);

            } catch {}

        }

        function getCookie(cname) {
            var name = cname + "=";
            var decodedCookie = decodeURIComponent(document.cookie);
            var ca = decodedCookie.split(';');
            for(var i = 0; i <ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.toLowerCase().indexOf(name.toLowerCase()) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        }

        var res = [];

        hoverZoom.urlReplace(res,
            'img[src*="/shrink_"]',
            /\/shrink_.*?\//,
            '/'
        );

        callback($(res), this.name);
    }
});
