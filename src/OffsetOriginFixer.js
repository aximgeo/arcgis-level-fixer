var http = require('http'),
    config = require('../config.json'),
    correctResolutions = config.correctResolutions,
    allowedResolutionError = config.allowedResolutionError,
    images = require('images'),
    async = require('async'),
    Stream = require('stream').Transform;

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
        "alf":protocol + "://" + host + "/fix-n-serve/" + urlPart + "/arcgis/z/{z}/y/{y}/x/{x}",
        "lods":this.getValidLODs()
    };
};

exports.OffsetOriginFixer.prototype.getCorrectTile = function (baseUrl, queryParams, x, y, z, callback) {
    var adjustedZ = this.getCorrectZoomLevel(z);

    console.log(baseUrl, this.lodMapper, x, y, z, adjustedZ);

    if(z == null) {
        return;
    }

    //TODO: need to determine the correct offset to use
    var xOffset = 20, yOffset = 20;

    var tileNW, tileNE, tileSW, tileSE;
    var tileWidth = this.tileinfo.cols, tileHeight = this.tileinfo.rows;
    async.parallel([
        function(callback) {
            getTileImage(baseUrl, x, y, adjustedZ, function(err, tile) {
                tileNW = images(images(tile), tileWidth - xOffset, tileHeight - yOffset, xOffset, yOffset);
                callback(err);
            });
        },
        function(callback) {
            getTileImage(baseUrl, x+1, y, adjustedZ, function(err, tile) {
                tileNE = images(images(tile), 0, tileHeight - yOffset, tileWidth - xOffset, yOffset);
                callback(err);
            });
        },
        function(callback) {
            getTileImage(baseUrl, x, y+1, adjustedZ, function(err, tile) {
                tileSW = images(images(tile), tileWidth - xOffset, 0, xOffset, tileHeight - yOffset);
                callback(err);
            });
        },
        function(callback) {
            getTileImage(baseUrl, x+1, y+1, adjustedZ, function(err, tile) {
                tileSE = images(images(tile), 0, 0, tileWidth - xOffset, tileHeight - yOffset);
                callback(err);
            });
        }
    ], function(err) {
        if(err) {
            return callback(err);
        }

        var img = images(256,256);
        
        img.draw(tileNW, 0, 0);
        img.draw(tileNE, xOffset, 0);
        img.draw(tileSW, 0, yOffset);
        img.draw(tileSE, xOffset, yOffset);

        return callback(undefined, img.encode('png'));
    });  
};

function getTileImage(baseUrl, x, y, z, callback) {
    var url = baseUrl + "/tile/" + z + "/" + y + "/" + x;
    console.log(url);
    http.request(url, function(response) {
        var data = new Stream();                                                    

        response.on('data', function(chunk) {
            data.push(chunk);
        });

        response.on('end', function() {
            return callback(undefined, data.read());                            
        });                                                                         
    }).end();
}

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
