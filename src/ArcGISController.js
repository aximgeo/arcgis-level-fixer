var ZoomLevelMapper = require('./ZoomLevelMapper.js').ZoomLevelMapper,
    url = require('url');

exports.ArcGISController = function() {
    "use strict";

    this.LODCache = {};

    var self = this;
    setInterval(function clearOldCacheItems() {
        for(var cacheKey in self.LODCache) {
            var cacheItem = self.LODCache[cacheKey];
            if(cacheItem == null || cacheItem.lastTouch < Date.now() - 300000) {
                delete self.LODCache[cacheKey];
            }
        }
    }, 60000);
};

exports.ArcGISController.prototype.getZoomLevelMapper = function (url, callback) {
    "use strict";
    if(this.LODCache[url] == null) {
        var zoomLevelMapper = new ZoomLevelMapper(url);
        zoomLevelMapper.init(function(err) {
            if(err) {
                return callback(err);
            }
            return callback(undefined, zoomLevelMapper);
        });
    } else {
        return callback(undefined, this.LODCache[url]);
    }
};
exports.ArcGISController.prototype.getRedirectUrl = function (req, res) {
    "use strict";
    try {
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;

        this.getZoomLevelMapper(query.url, function(err, zoomLevelMapper) {
            if(err) {
                res.status(500).send("this doesn't taste like a cat.");
                console.log(err);
                return;
            }

            var results = {
                "alf":req.protocol + "://" + req.headers.host + "/" + query.url + "/arcgis/z/{z}/y/{y}/x/{x}",
                "lods":zoomLevelMapper.getValidLODs()
            };

            res.json(results);
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
            z = req.url.match(parseZ)[1],
            y = req.url.match(parseY)[1],
            x = req.url.match(parseX)[1];

        if(!isInt(z) || !isInt(x) || !isInt(y)) {
            res.status(500).send("X/Y/Z need to be integers");
            return;
        }

        this.getZoomLevelMapper(url, function(err, zoomLevelMapper) {
            if(err) {
                res.status(500).send(err.message);
                return;
            }

            z = zoomLevelMapper.getCorrectZoomLevel(z);

            if(z == null) {
                res.status(404).send("The requested LOD is not defined");
                return;
            }

            var redirectUrl = req.protocol + "://" + url + "/tile/"+z+"/"+y+"/"+x;
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