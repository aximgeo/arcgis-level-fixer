var ArcGISController = require('./ArcGISController.js').ArcGISController,
    arcGISController = new ArcGISController();

exports.setup = function (app) {
    "use strict";
    app.get('*', arcGISController.getRedirectUrl.bind(arcGISController));
};
