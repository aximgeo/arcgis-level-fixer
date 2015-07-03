var config = require('../config.json'),
    correctResolutions = config.correctResolutions,
    allowedResolutionError = config.allowedResolutionError,
    images = require('images'),
    async = require('async'),
    http = require('http'),
    Stream = require('stream').Transform;

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

exports.ZoomLevelFixer.prototype.getProxyUrl = function (protocol, host, urlPart) {
    "use strict";
    return {
        "alf":protocol + "://" + host + "/" + urlPart + "/arcgis/z/{z}/y/{y}/x/{x}",
        "lods":this.getValidLODs()
    };
};

exports.ZoomLevelFixer.prototype.getFixedTile = function (baseUrl, queryParams, x, y, z, callback) {
    "use strict";
    var adjustedZ = this.getCorrectZoomLevel(z);

    if(adjustedZ == null) {
        return callback();
    }

    if(this.withinPercentage(this.tileinfo.origin.x, config.correctOrigin.x, allowedResolutionError) &&
        this.withinPercentage(this.tileinfo.origin.y, config.correctOrigin.y, allowedResolutionError)) {
        return callback(undefined, {"redirect":baseUrl + "/tile/"+z+"/"+y+"/"+x});
    } else {
        var tileWidth = this.tileinfo.cols, 
            tileHeight = this.tileinfo.rows;

        /**
         * According to: http://wiki.osgeo.org/wiki/Tile_Map_Service_Specification#global-mercator
         * origin is the lower left corner of the 0/0 tile
         */
        var unitsPerPixel = 78271.516 / Math.pow(2,adjustedZ+1);
        var adjustedX = x-((config.correctOrigin.x - this.tileinfo.origin.x) / unitsPerPixel),
            adjustedY = y-((config.correctOrigin.y - this.tileinfo.origin.y) / unitsPerPixel);

        var adjustedTileX = Math.floor(adjustedX),
            adjustedTileY = Math.floor(adjustedY);

        var xOffset = Math.floor(tileWidth * (adjustedX - adjustedTileX)), 
            yOffset = Math.floor(tileHeight * (adjustedY - adjustedTileY));
        
        var img = images(256,256);
            
        async.parallel([
            function getAndDrawNorthWestTile(callback) {
                getTileImage(baseUrl, adjustedTileX, adjustedTileY, adjustedZ, xOffset, yOffset, tileWidth-xOffset, tileHeight-yOffset, function(err, tile) {
                    if(tile != null) {
                        img.draw(tile, 0, 0);
                    }
                    callback();
                });
            },
            function getAndDrawNorthEastTile(callback) {
                getTileImage(baseUrl, adjustedTileX+1, adjustedTileY, adjustedZ, 0,  yOffset, xOffset, tileHeight-yOffset, function(err, tile) {
                    if(tile != null) {
                        img.draw(tile, tileWidth-xOffset, 0);
                    }
                    callback();
                });
            },
            function getAndDrawSouthWestTile(callback) {
                getTileImage(baseUrl, adjustedTileX, adjustedTileY+1, adjustedZ, xOffset, 0, tileWidth-xOffset, yOffset, function(err, tile) {
                    if(tile != null) {
                        img.draw(tile, 0, tileHeight-yOffset);
                    }
                    callback();
                });
            },
            function getAndDrawSouthEastTile(callback) {
                getTileImage(baseUrl, adjustedTileX+1, adjustedTileY+1, adjustedZ, 0, 0, xOffset, yOffset, function(err, tile) {
                    if(tile != null) {
                        img.draw(tile, tileWidth-xOffset, tileHeight-yOffset);
                    }
                    callback();
                });
            }
        ], function(err) {
            if(err) {
                return callback(err);
            }
            return callback(undefined, {"tile":img.encode('png')});
        });
    }  
};

function getTileImage(baseUrl, x, y, z, imgX, imgY, imgW, imgH, callback) {
    "use strict";
    var url = baseUrl + "/tile/" + z + "/" + y + "/" + x;
    http.request(url, function(response) {
        var data = new Stream();                                                    

        response.on('data', function(chunk) {
            data.push(chunk);
        });

        response.on('end', function() {
            if(response.statusCode === 404) {
                //no tile data
                return callback();
            }

            try {
                var tile = images(images(data.read()), imgX, imgY, imgW, imgH);
                return callback(undefined, tile);
            } catch(e) {
                return callback(e);
            }                            
        });                                                                         
    }).end();
}

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
