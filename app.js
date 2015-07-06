/*!
ArcGIS Level Fixer v0.3.2-4-b4bd5b5
Copyright 2014 Geographic Information Services, Inc 
ALF uses third-party libraries which remain the property of their respective authors.
*/

var express = require("express"), http = require("http"), https = require("https"), fs = require("fs"), config = require("./config.json"), routes = require("./src/routes.js"), httpsApp = express(), httpApp = express(), favicon = require("serve-favicon");

var allowCrossDomain = function(req, res, next) {
    "use strict";
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "content-type, authorization, content-length, x-requested-with");
    next();
};

httpApp.use(favicon(__dirname + "/images/favicon.png"));

httpApp.use(allowCrossDomain);

httpApp.use("/images", express.static(__dirname + "/images"));

routes.setup(httpApp);

httpApp.set("port", process.env.PORT || config.http.port);

http.createServer(httpApp).listen(httpApp.get("port"), function() {
    "use strict";
    console.log("http  is listening on port", httpApp.get("port"));
});

if (config.https != null) {
    httpsApp.use(allowCrossDomain);
    routes.setup(httpsApp);
    var sslOptions = {}, key = config.https.key, cert = config.https.cert, ca = config.https.ca;
    if (typeof key !== "undefined") {
        sslOptions.key = fs.readFileSync(key, "utf8");
    }
    if (typeof cert !== "undefined") {
        sslOptions.cert = fs.readFileSync(cert, "utf8");
    }
    if (typeof ca !== "undefined") {
        sslOptions.ca = [];
        for (var ci = 0; ci < ca.length; ci++) {
            var caFile = ca[ci];
            sslOptions.ca.push(fs.readFileSync(caFile, "utf8"));
        }
    }
    https.createServer(sslOptions, httpsApp).listen(config.https.port, function() {
        "use strict";
        console.log("http  is listening on port", config.https.port);
    });
}