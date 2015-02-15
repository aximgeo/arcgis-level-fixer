var config = require('../config.json'),
    TileifyAGS = require('tileify-ags').TileifyAGS;

exports.UncachedFixer = function(url) {
    "use strict";
    this.url = url;
};

exports.UncachedFixer.prototype.getRedirectData = function (protocol, host, urlPart) {
    return {
        "alf":protocol + "://" + host + "/" + urlPart + "/arcgis/z/{z}/y/{y}/x/{x}"
    };
};

exports.UncachedFixer.prototype.getRedirectUrl = function (baseUrl, queryParams, x, y, z) {
    var tiler = new TileifyAGS(queryParams);
    return tiler.getTileUrl(baseUrl, x, y, z);
};
