var ArcGISController = require('./ArcGISController.js').ArcGISController,
    arcGISController = new ArcGISController(),
    path = require('path'),
    appDir = path.dirname(require.main.filename);

exports.setup = function (app) {
    "use strict";
    app.get('[/]?', function(req, res) {
      var options = {
        root: appDir,
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
      };

      res.sendFile("index.html", options, function (err) {
        if (err) {
          console.log(err);
          res.status(err.status).end();
        }
      });
    });
    app.get('/examine', arcGISController.getRedirectUrl.bind(arcGISController));
    app.get('/fix-n-serve/', arcGISController.fixAndServe.bind(arcGISController));
    app.get('*', arcGISController.performRedirectUrl.bind(arcGISController));
};
