var TileifyAGS = require('tileify-ags').TileifyAGS;

exports.UncachedFixer = function(url) {
    "use strict";
    this.url = url;
};

exports.UncachedFixer.prototype.getRedirectData = function (protocol, host, urlPart) {
    "use strict";
    return {
        "alf":protocol + "://" + host + "/" + urlPart + "/arcgis/z/{z}/y/{y}/x/{x}"
    };
};

exports.UncachedFixer.prototype.getRedirectUrl = function (baseUrl, queryParams, x, y, z) {
    "use strict";
    var tiler = new TileifyAGS(queryParams);
    return tiler.getTileUrl(baseUrl, x, y, z);
};
