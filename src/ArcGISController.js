var ZoomLevelMapper = require('./ZoomLevelMapper.js').ZoomLevelMapper;

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
}

exports.ArcGISController.prototype.getRedirectUrl = function (req, res) {
    "use strict";

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
};

function isInt(n) {
    return n % 1 === 0;
}