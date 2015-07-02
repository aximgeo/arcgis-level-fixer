var http = require('http'),
    config = require('../config.json'),
    correctResolutions = config.correctResolutions,
    allowedResolutionError = config.allowedResolutionError;

exports.OffsetOriginFixer = function(url, tileinfo) {
    "use strict";
    this.url = url;
    this.lodMapper = {};
    this.tileinfo = tileinfo;

    //create the zoom level data
    var arcgisLODs = this.tileinfo.lods;

    for(var i = 0; i < arcgisLODs.length; i++) {
        var arcgisLOD = arcgisLODs[i];
        for(var ci in correctResolutions) {
            var correctRes = correctResolutions[ci];

            if(this.withinPercentage(arcgisLOD.resolution, correctRes, allowedResolutionError)) {
                this.lodMapper[ci] = arcgisLOD.level;
                break;
            }
        }
    }
};

/**
    This method is used to return the proxy's URL
 */
exports.OffsetOriginFixer.prototype.getRedirectData = function (protocol, host, urlPart) {
    "use strict";
    return {
        "alf":"fix-n-serve/" + protocol + "://" + host + "/" + urlPart + "/arcgis/z/{z}/y/{y}/x/{x}",
        "lods":this.getValidLODs()
    };
};

exports.OffsetOriginFixer.prototype.getCorrectTile = function (baseUrl, queryParams, x, y, z) {
    z = this.getCorrectZoomLevel(z);

    if(z == null) {
        return;
    }

    //TODO: parse out the new tile from 4 tiles
    return null;
};

exports.OffsetOriginFixer.prototype.getValidLODs = function () {
    "use strict";
    return this.lodMapper;
};

exports.OffsetOriginFixer.prototype.withinPercentage = function (a, b, percentage) {
    "use strict";
    var diff = Math.abs((a/b) - 1);
    return diff < percentage;
};

exports.OffsetOriginFixer.prototype.getCorrectZoomLevel = function (z) {
    "use strict";
    return this.lodMapper[z];
};
