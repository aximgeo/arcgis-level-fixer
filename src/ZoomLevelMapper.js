var http = require('http');

exports.ZoomLevelMapper = function(url) {
    "use strict";

    this.url = url;
};

exports.ZoomLevelMapper.prototype.init = function (callback) {
    "use strict";

    this.getArcGISConfiguration(function(err, data) {
        if(err) {
            return callback(err);
        }

        if(data == null || data.tileInfo == null || data.tileInfo.lods == null) {
            return callback(new Error("LODs not defined for MapServer"));
        } else {
            //create the zoom level data
            console.log(data.tileInfo.lods);
            return callback(undefined, data);
        }
    });
};

exports.ZoomLevelMapper.prototype.getArcGISConfiguration = function (callback) {
    "use strict";
    var configUrl = 'http://' + this.url + '?f=pjson';
    console.log(configUrl);
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
                console.log(e);
            }
            return callback(undefined, json);
        });
    }).on('error', function(e) {
        return callback(e);
    });
};

exports.ZoomLevelMapper.prototype.getCorrectZoomLevel = function (z) {
    "use strict";

};
