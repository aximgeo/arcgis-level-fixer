var ArcGISController = require('./ArcGISController.js').ArcGISController,
    arcGISController = new ArcGISController();

exports.setup = function (app) {
    "use strict";
    //redirect to arcgis
    app.get(    '/arcgis/z/:z/y/:y/x/:x[/]?', arcGISController.getRedirectUrl);
};
