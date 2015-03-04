/*!
ArcGIS Level Fixer v--3d8d678
Copyright 2014 Geographic Information Services, Inc 
ALF uses third-party libraries which remain the property of their respective authors.
*/

var ArcGISController = require("./ArcGISController.js").ArcGISController, arcGISController = new ArcGISController(), path = require("path"), appDir = path.dirname(require.main.filename);

exports.setup = function(app) {
    "use strict";
    app.get("[/]?", function(req, res) {
        var options = {
            root: appDir,
            dotfiles: "deny",
            headers: {
                "x-timestamp": Date.now(),
                "x-sent": true
            }
        };
        res.sendFile("index.html", options, function(err) {
            if (err) {
                console.log(err);
                res.status(err.status).end();
            }
        });
    });
    app.get("/examine", arcGISController.getRedirectUrl.bind(arcGISController));
    app.get("*", arcGISController.performRedirectUrl.bind(arcGISController));
};