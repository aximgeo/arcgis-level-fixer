var TileFixerFactory = require('./TileFixerFactory.js').TileFixerFactory,
    url = require('url');

exports.ArcGISController = function() {
    "use strict";

    this.TileFixerCache = {};

    var self = this;
    setInterval(function clearOldCacheItems() {
        for(var cacheKey in self.TileFixerCache) {
            var cacheItem = self.TileFixerCache[cacheKey];
            if(cacheItem == null || cacheItem.lastTouch < Date.now() - 300000) {
                delete self.TileFixerCache[cacheKey];
            }
        }
    }, 60000);
};

exports.ArcGISController.prototype.getTileFixer = function (url, callback) {
    "use strict";
    var self = this;
    var cachedFixer = this.TileFixerCache[url]
    if(cachedFixer != null){
        return callback(undefined, this.TileFixerCache[url]);
    } else {
        TileFixerFactory.createTileMapper(url, function(err, fixer) {
            if(err) {
                return callback(err);
            }
            fixer.lastTouch = Date.now();
            self.TileFixerCache[url] = fixer;
            return callback(undefined, fixer);
        });
    }
};

exports.ArcGISController.prototype.getRedirectUrl = function (req, res) {
    "use strict";
    try {
        var mapserverUrl = req.query.url;

        this.getTileFixer(mapserverUrl, function(err, fixer) {
            if(err) {
                res.status(500).send("this doesn't taste like a cat.");
                return;
            }

            res.json(fixer.getRedirectData(req.protocol, req.headers.host, mapserverUrl));
        });
    } catch (ex) {
        console.log(ex);
        res.status(500).send("this doesn't taste like a cat.");
    }
};

exports.ArcGISController.prototype.fixAndServe = function (req, res) {
    "use strict";
    try {
        console.log("FIX-N-SERVE", req.url);


        var parseUrl = /[/]?fix[-]n[-]serve[/](.*(?=[\/]arcgis[\/]?))/i,
            parseZ = /z\/([0-9]+)/i,
            parseY = /y\/([0-9]+)/i,
            parseX = /x\/([0-9]+)/i;

        var url = req.url.match(parseUrl)[1],
            z = parseInt(req.url.match(parseZ)[1], 10),
            y = parseInt(req.url.match(parseY)[1], 10),
            x = parseInt(req.url.match(parseX)[1], 10),
            baseUrl = url,
            queryParams = req.query;

        if(!isInt(z) || !isInt(x) || !isInt(y)) {
            res.status(500).send("X/Y/Z need to be integers");
            return;
        }

        this.getTileFixer(url, function(err, fixer) {
            if(err) {
                res.status(500).send(err.message);
                return;
            }

            if(typeof fixer.getCorrectTile !== "function"){
                res.status(500).send("invalid route");
                return;
            }

            fixer.getCorrectTile(baseUrl, queryParams, x, y, z, function(err, tile) {
                if(tile == null) {
                    res.status(404).send("The requested tile is not available");
                    return;
                }

                res.writeHead(200, {'Content-Type': 'image/png' });
                res.end(tile, 'binary');
            });
        });
    } catch (ex) {
        console.log(ex);
        res.status(500).send("this doesn't taste like a cat.");
    }
};

exports.ArcGISController.prototype.performRedirectUrl = function (req, res) {
    "use strict";

    try {
        console.log(req.url);

        var parseUrl = /[/]?(.*(?=[\/]arcgis[\/]?))/i,
            parseZ = /z\/([0-9]+)/i,
            parseY = /y\/([0-9]+)/i,
            parseX = /x\/([0-9]+)/i;

        var url = req.url.match(parseUrl)[1],
            z = parseInt(req.url.match(parseZ)[1], 10),
            y = parseInt(req.url.match(parseY)[1], 10),
            x = parseInt(req.url.match(parseX)[1], 10),
            baseUrl = url,
            queryParams = req.query;

        if(!isInt(z) || !isInt(x) || !isInt(y)) {
            res.status(500).send("X/Y/Z need to be integers");
            return;
        }

        this.getTileFixer(url, function(err, fixer) {
            if(err) {
                res.status(500).send(err.message);
                return;
            }
            var redirectUrl = fixer.getRedirectUrl(baseUrl, queryParams, x, y, z);
            if(redirectUrl == null) {
                res.status(404).send("The requested tile is not available");
                return;
            }
            res.redirect(redirectUrl);
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