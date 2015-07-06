/*!
ArcGIS Level Fixer v0.3.2-4-b4bd5b5
Copyright 2014 Geographic Information Services, Inc 
ALF uses third-party libraries which remain the property of their respective authors.
*/

var TileifyAGS = require("tileify-ags").TileifyAGS;

exports.UncachedFixer = function(url, center) {
    "use strict";
    this.url = url;
    this.center = center;
};

exports.UncachedFixer.prototype.getProxyUrl = function(protocol, host, urlPart) {
    "use strict";
    return {
        alf: protocol + "://" + host + "/" + urlPart + "/arcgis/z/{z}/y/{y}/x/{x}",
        center: this.center
    };
};

exports.UncachedFixer.prototype.getFixedTile = function(baseUrl, queryParams, x, y, z, callback) {
    "use strict";
    var tiler = new TileifyAGS(queryParams);
    return callback(undefined, {
        redirect: tiler.getTileUrl(baseUrl, x, y, z)
    });
};