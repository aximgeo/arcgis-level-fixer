var ArcGISController = require('./ArcGISController.js').ArcGISController,
    arcGISController = new ArcGISController();

exports.setup = function (app) {
    "use strict";
    app.get('[/]?', function(req, res) {
        res.sendfile('index.html');
    });
    app.get('/examine', arcGISController.getRedirectUrl.bind(arcGISController));
    app.get('*', arcGISController.performRedirectUrl.bind(arcGISController));
};
