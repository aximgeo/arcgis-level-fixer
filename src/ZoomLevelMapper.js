var http = require('http'),
    config = require('../config.json'),
    correctResolutions = config.correctResolutions,
    allowedResolutionError = config.allowedResolutionError;

exports.ZoomLevelMapper = function(url) {
    "use strict";

    this.url = url;
    this.lodMapper = {};
};

exports.ZoomLevelMapper.prototype.init = function (callback) {
    "use strict";
    var self = this;
    this.getArcGISConfiguration(function(err, data) {
        if(err) {
            return callback(err);
        }

        if(data == null || data.tileInfo == null || data.tileInfo.lods == null) {
            return callback(new Error("LODs not defined for MapServer"));
        } else {
            //create the zoom level data
            var arcgisLODs = data.tileInfo.lods;

            for(var i = 0; i < arcgisLODs.length; i++) {
                var arcgisLOD = arcgisLODs[i];
                for(var ci in correctResolutions) {
                    var correctRes = correctResolutions[ci];

                    if(self.withinPercentage(arcgisLOD.resolution, correctRes, allowedResolutionError)) {
                        self.lodMapper[ci] = arcgisLOD.level;
                        break;
                    }
                }
            }

            return callback(undefined);
        }
    });
};

exports.ZoomLevelMapper.prototype.getValidLODs = function () {
    "use strict";
    return this.lodMapper;
};

exports.ZoomLevelMapper.prototype.withinPercentage = function (a, b, percentage) {
    "use strict";
    var diff = Math.abs((a/b) - 1);
    return diff < percentage;
};

exports.ZoomLevelMapper.prototype.getArcGISConfiguration = function (callback) {
    "use strict";
    var configUrl = 'http://' + this.url + '?f=pjson';
    http.get(configUrl, function(res) {
        var body = '';

        res.on('data', function(chunk) {
            body += chunk;
        });

        res.on('end', function() {
            var json;
            try {
                json = JSON.parse(body);
            } catch (e) {
                return callback(e);
            }
            return callback(undefined, json);
        });
    }).on('error', function(e) {
        return callback(e);
    });
};

exports.ZoomLevelMapper.prototype.getCorrectZoomLevel = function (z) {
    "use strict";
    return this.lodMapper[z];
};
