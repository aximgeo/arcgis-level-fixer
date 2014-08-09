exports.ArcGISController = function() {
    "use strict";
};

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

    var redirectUrl = "http://" + url + "/tile/"+z+"/"+y+"/"+x;
    console.log(redirectUrl);
    res.redirect(redirectUrl);
};

function isInt(n) {
    return n % 1 === 0;
}