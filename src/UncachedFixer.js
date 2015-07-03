var TileifyAGS = require('tileify-ags').TileifyAGS;

exports.UncachedFixer = function(url) {
    "use strict";
    this.url = url;
};

exports.UncachedFixer.prototype.getProxyUrl = function (protocol, host, urlPart) {
    "use strict";
    return {
        "alf":protocol + "://" + host + "/" + urlPart + "/arcgis/z/{z}/y/{y}/x/{x}"
    };
};

exports.UncachedFixer.prototype.getFixedTile = function (baseUrl, queryParams, x, y, z, callback) {
    "use strict";
    var tiler = new TileifyAGS(queryParams);
    return callback(undefined, tiler.getTileUrl(baseUrl, x, y, z));
};
