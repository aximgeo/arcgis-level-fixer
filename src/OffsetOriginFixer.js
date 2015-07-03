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
    "use strict";
    var adjustedZ = this.getCorrectZoomLevel(z);

    console.log(baseUrl, this.lodMapper, x, y, z, adjustedZ);

    if(z == null) {
        return;
    }

    // using: https://msdn.microsoft.com/en-us/library/bb259689.aspx
    //map width = map height = (256 * 2 ^ level) pixels

    /*
    // not sure where "origin" comes into play... maybe it's as simple as creating a ratio...
    var xRatio = this.tileinfo.origin.x / config.correctOrigin.x,
        yRatio = this.tileinfo.origin.y / config.correctOrigin.y;

    var adjustedX = x * xRatio,
        adjustedY = y * yRatio;

    var adjustedTileX = Math.floor(adjustedX),
        adjustedTileY = Math.floor(adjustedY);
    */

    var tileWidth = this.tileinfo.cols, 
        tileHeight = this.tileinfo.rows;

    /**
     * According to: http://wiki.osgeo.org/wiki/Tile_Map_Service_Specification#global-mercator
     * origin is the lower left corner of the 0/0 tile
     */
    var unitsPerPixel = 78271.516 / Math.pow(2,adjustedZ+1);
    var adjustedX = ((config.correctOrigin.x - this.tileinfo.origin.x) / unitsPerPixel),
        adjustedY = ((config.correctOrigin.y - this.tileinfo.origin.y) / unitsPerPixel);

    console.log("unitsPerPixel", unitsPerPixel);
    console.log("x", x);
    console.log("y", y);
    console.log("adjustedX", adjustedX);
    console.log("adjustedY", adjustedY);
    console.log("x-adjustedX", x-adjustedX);
    console.log("y-adjustedY", y-adjustedY);

    adjustedX = x-adjustedX;
    adjustedY = y-adjustedY;

    var adjustedTileX = Math.floor(adjustedX),
        adjustedTileY = Math.floor(adjustedY);

    var xOffset = Math.floor(tileWidth * (adjustedX - adjustedTileX)), 
        yOffset = Math.floor(tileHeight * (adjustedY - adjustedTileY));

    console.log("X", x, adjustedX, adjustedTileX, xOffset);
    console.log("Y", y, adjustedY, adjustedTileY, yOffset);

    var tileNW, tileNE, tileSW, tileSE;
    async.parallel([
        function(callback) {
            getTileImage(baseUrl, adjustedTileX, adjustedTileY, adjustedZ, function(err, tile) {
                if(err != null || tile == null) {
                    return callback();
                }
                console.log("NW", tile);
                try {
                    tileNW = images(images(tile), xOffset, yOffset, tileWidth-xOffset, tileHeight-yOffset);
                } catch(e) {
                    console.log("NW", e);
                }
                callback(err);
            });
        },
        function(callback) {
            getTileImage(baseUrl, adjustedTileX+1, adjustedTileY, adjustedZ, function(err, tile) {
                if(err != null || tile == null) {
                    return callback();
                }
                console.log("NE", tile);
                try {
                    tileNE = images(images(tile), 0,  yOffset, xOffset, tileHeight-yOffset);
                } catch(e) {
                    console.log("NE", e);
                }
                callback(err);
            });
        },
        function(callback) {
            getTileImage(baseUrl, adjustedTileX, adjustedTileY+1, adjustedZ, function(err, tile) {
                if(err != null || tile == null) {
                    return callback();
                }
                console.log("SW", tile);
                try {
                    tileSW = images(images(tile), xOffset, 0, tileWidth-xOffset, yOffset);
                } catch(e) {
                    console.log("SW", e);
                }
                callback(err);
            });
        },
        function(callback) {
            getTileImage(baseUrl, adjustedTileX+1, adjustedTileY+1, adjustedZ, function(err, tile) {
                if(err != null || tile == null) {
                    return callback();
                }
                console.log("SE", tile);
                try {
                    tileSE = images(images(tile), 0, 0, xOffset, yOffset);
                } catch(e) {
                    console.log("SE", e);
                }
                callback(err);
            });
        }
    ], function(err) {
        if(err) {
            return callback(err);
        }

        var img = images(256,256);
        
        if(tileNW != null) {
            img.draw(tileNW, 0, 0);
        }
        if(tileNE != null) {
            img.draw(tileNE, tileWidth-xOffset, 0);
        }
        if(tileSW != null) {
            img.draw(tileSW, 0, tileHeight-yOffset);
        }
        if(tileSE != null) {
            img.draw(tileSE, tileWidth-xOffset, tileHeight-yOffset);
        }

        return callback(undefined, img.encode('png'));
    });  
};

function getTileImage(baseUrl, x, y, z, callback) {
    "use strict";
    var url = baseUrl + "/tile/" + z + "/" + y + "/" + x;
    console.log(url);
    http.request(url, function(response) {
        var data = new Stream();                                                    

        response.on('data', function(chunk) {
            data.push(chunk);
        });

        response.on('end', function() {
            console.log(response.statusCode);
            if(response.statusCode === 404) {
                return callback();
            }
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
