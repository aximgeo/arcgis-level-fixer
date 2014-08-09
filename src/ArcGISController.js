exports.ArcGISController = function() {
    "use strict";
};

exports.ArcGISController.prototype.getRedirectUrl = function (req, res) {
    "use strict";

    res.redirect("http://gismaps.vita.virginia.gov/arcgis/rest/services/MostRecentImagery/MostRecentImagery_WGS/MapServer/tile/0/50/37");
};