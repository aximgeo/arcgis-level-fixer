/*!
ArcGIS Level Fixer v0.3.2-4-b4bd5b5
Copyright 2014 Geographic Information Services, Inc 
ALF uses third-party libraries which remain the property of their respective authors.
*/

var TileFixerFactory = require("./TileFixerFactory.js").TileFixerFactory;

exports.ArcGISController = function() {
    "use strict";
    this.TileFixerCache = {};
    var self = this;
    setInterval(function clearOldCacheItems() {
        for (var cacheKey in self.TileFixerCache) {
            var cacheItem = self.TileFixerCache[cacheKey];
            if (cacheItem == null || cacheItem.lastTouch < Date.now() - 3e5) {
                delete self.TileFixerCache[cacheKey];
            }
        }
    }, 6e4);
};

exports.ArcGISController.prototype.getTileFixer = function(url, callback) {
    "use strict";
    var self = this;
    var cachedFixer = this.TileFixerCache[url];
    if (cachedFixer != null) {
        return callback(undefined, this.TileFixerCache[url]);
    } else {
        TileFixerFactory.createTileMapper(url, function(err, fixer) {
            if (err) {
                return callback(err);
            }
            fixer.lastTouch = Date.now();
            self.TileFixerCache[url] = fixer;
            return callback(undefined, fixer);
        });
    }
};

exports.ArcGISController.prototype.getProxyUrl = function(req, res) {
    "use strict";
    try {
        var mapserverUrl = req.query.url;
        this.getTileFixer(mapserverUrl, function(err, fixer) {
            if (err) {
                res.status(500).send("this doesn't taste like a cat.");
                return;
            }
            var alfProxy = fixer.getProxyUrl(req.protocol, req.headers.host, mapserverUrl);
            console.log(alfProxy);
            res.json(alfProxy);
        });
    } catch (ex) {
        console.log(ex);
        res.status(500).send("this doesn't taste like a cat.");
    }
};

exports.ArcGISController.prototype.performProxy = function(req, res) {
    "use strict";
    try {
        console.log(req.url);
        var parseUrl = /[/]?(.*(?=[\/]arcgis[\/]?))/i, parseZ = /z\/([0-9]+)/i, parseY = /y\/([0-9]+)/i, parseX = /x\/([0-9]+)/i;
        var url = req.url.match(parseUrl)[1], z = parseInt(req.url.match(parseZ)[1], 10), y = parseInt(req.url.match(parseY)[1], 10), x = parseInt(req.url.match(parseX)[1], 10), baseUrl = url, queryParams = req.query;
        if (!isInt(z) || !isInt(x) || !isInt(y)) {
            res.status(500).send("X/Y/Z need to be integers");
            return;
        }
        this.getTileFixer(url, function(err, fixer) {
            if (err) {
                res.status(500).send(err.message);
                return;
            }
            fixer.getFixedTile(baseUrl, queryParams, x, y, z, function(err, fixResults) {
                if (fixResults == null) {
                    res.status(404).send("The requested tile is not available");
                    return;
                }
                if (fixResults.tile != null) {
                    res.writeHead(200, {
                        "Content-Type": "image/png"
                    });
                    res.end(fixResults.tile, "binary");
                } else if (fixResults.redirect != null) {
                    res.redirect(fixResults.redirect);
                } else {
                    res.status(404).send("The requested tile is not available");
                }
            });
        });
    } catch (ex) {
        console.log(ex);
        res.status(500).send("Bad request");
    }
};

function isInt(n) {
    "use strict";
    return n % 1 === 0;
}