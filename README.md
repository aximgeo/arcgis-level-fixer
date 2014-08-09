![](http://img2.wikia.nocookie.net/__cb20110128060130/alf/images/9/92/Cat_sandwich.jpg)
# ALF
 **ArcGIS** zoom **Level** **Fixer** - Eats Cats And Zoom Levels


---

ArcGIS map services do not require all "zoom levels" to be published. This messes up the zoom level index for other applications, which always starts at 0. This project intends to make it a little smarter.

This application does the following:

1. Looks up the ArcGIS MapServer's LOD configuration
2. Compares the zoom level resolutions to the [OSM zoom levels](http://wiki.openstreetmap.org/wiki/Zoom_levels) 
3. Redirects the request with a 302 status code to the ArcGIS MapServer


Demo Access
-----------

An AWS t2.micro is hosting this code here: http://arcgis-level-fixer.elasticbeanstalk.com

Usage
-----

If you want to load an ArcGIS url like this:

http://gismaps.vita.virginia.gov/arcgis/rest/services/MostRecentImagery/MostRecentImagery_WGS/MapServer/{z}/{y}/{x}

Into a map viewer that is expecting typical [OSM zoom levels](http://wiki.openstreetmap.org/wiki/Zoom_levels), you can instead use this url:

http://arcgis-level-fixer.elasticbeanstalk.com/gismaps.vita.virginia.gov/arcgis/rest/services/MostRecentImagery/MostRecentImagery_WGS/MapServer/arcgis/z/{z}/y/{y}/x/{x}
