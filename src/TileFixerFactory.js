var http = require('http'),
    config = require('../config.json'),
    UncachedFixer = require('./UncachedFixer.js').UncachedFixer,
    ZoomLevelFixer = require('./ZoomLevelFixer.js').ZoomLevelFixer;

exports.TileFixerFactory = function() {
    "use strict";
};

exports.TileFixerFactory.createTileMapper = function (url, callback) {
    "use strict";
    exports.TileFixerFactory.getArcGISConfiguration(url, function(err, data) {
        if(err) {
            return callback(err);
        }

        if (data != null && data.tileInfo != null && data.tileInfo.lods != null) {
            //create ZoomLevelFixer
            callback(undefined, new ZoomLevelFixer(url, data.tileInfo));
        } else if (data != null && data.supportedImageFormatTypes != null){
            // create UncachedFixer
            callback(undefined, new UncachedFixer(url));
        } else {
            callback(new Error("Unsupported URL"));
        }
    });
};

exports.TileFixerFactory.getArcGISConfiguration = function (url, callback) {
    "use strict";
    var configUrl = 'http://' + url + '?f=pjson';
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

