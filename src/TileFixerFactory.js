/*!
ArcGIS Level Fixer v--3d8d678
Copyright 2014 Geographic Information Services, Inc 
ALF uses third-party libraries which remain the property of their respective authors.
*/

var https = require("https"), http = require("http"), url = require("url"), config = require("../config.json"), UncachedFixer = require("./UncachedFixer.js").UncachedFixer, ZoomLevelFixer = require("./ZoomLevelFixer.js").ZoomLevelFixer;

exports.TileFixerFactory = function() {
    "use strict";
};

exports.TileFixerFactory.createTileMapper = function(url, callback) {
    "use strict";
    exports.TileFixerFactory.getArcGISConfiguration(url, function(err, data) {
        if (err) {
            return callback(err);
        }
        if (data != null && data.tileInfo != null && data.tileInfo.lods != null) {
            callback(undefined, new ZoomLevelFixer(url, data.tileInfo));
        } else if (data != null && data.currentVersion != null) {
            callback(undefined, new UncachedFixer(url));
        } else {
            callback(new Error("Unsupported URL"));
        }
    });
};

exports.TileFixerFactory.getArcGISConfiguration = function(mapserverUrl, callback) {
    "use strict";
    var configUrl = mapserverUrl + "?f=pjson";
    (url.parse(configUrl).protocol === "https:" ? https : http).get(configUrl, function(res) {
        var body = "";
        res.on("data", function(chunk) {
            body += chunk;
        });
        res.on("end", function() {
            var json;
            try {
                json = JSON.parse(body);
            } catch (e) {
                return callback(e);
            }
            return callback(undefined, json);
        });
    }).on("error", function(e) {
        return callback(e);
    });
};