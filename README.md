![](http://img2.wikia.nocookie.net/__cb20110128060130/alf/images/9/92/Cat_sandwich.jpg)
# ALF
 **ArcGIS** zoom **Level** **Fixer** - Eats Cats And Zoom Levels


---

ArcGIS map services do not require all "zoom levels" to be published. This messes up the zoom level index for other applications, which always starts at 0. This project intends to make it a little smarter.

This application does the following:

1. Looks up the ArcGIS MapServer's LOD configuration
2. Compares the zoom level resolutions to the [OSM zoom levels](http://wiki.openstreetmap.org/wiki/Zoom_levels) 
3. Redirects the request with a 302 status code to the ArcGIS MapServer


To use:
-----------

1. visit: http://gisinc.github.io/arcgis-level-fixer/
2. Create a proxy/redirect url
3. Use the new url!
 
If you like it:
---

Donate to a pet charity to feed the hungry cats...
:smiley_cat::smile_cat::heart_eyes_cat::kissing_cat::smirk_cat::scream_cat::joy_cat:
