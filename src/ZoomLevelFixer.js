var config = require('../config.json'),
    correctResolutions = config.correctResolutions,
    allowedResolutionError = config.allowedResolutionError;

exports.ZoomLevelFixer = function(url, tileinfo) {
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

exports.ZoomLevelFixer.prototype.getRedirectData = function (protocol, host, urlPart) {
    "use strict";
    return {
        "alf":protocol + "://" + host + "/" + urlPart + "/arcgis/z/{z}/y/{y}/x/{x}",
        "lods":this.getValidLODs()
    };
};

exports.ZoomLevelFixer.prototype.getRedirectUrl = function (baseUrl, queryParams, x, y, z) {
    "use strict";
    z = this.getCorrectZoomLevel(z);

    if(z == null) {
        return undefined;
    }

    return baseUrl + "/tile/"+z+"/"+y+"/"+x;
};

exports.ZoomLevelFixer.prototype.getValidLODs = function () {
    "use strict";
    return this.lodMapper;
};

exports.ZoomLevelFixer.prototype.withinPercentage = function (a, b, percentage) {
    "use strict";
    var diff = Math.abs((a/b) - 1);
    return diff < percentage;
};

exports.ZoomLevelFixer.prototype.getCorrectZoomLevel = function (z) {
    "use strict";
    return this.lodMapper[z];
};
