![](http://img2.wikia.nocookie.net/__cb20110128060130/alf/images/9/92/Cat_sandwich.jpg)
# ALF
 **ArcGIS** zoom **Level** **Fixer** - Eats Cats And Zoom Levels


---

**Use Case:** You've come across Open Data hosted on ArcServer or AGOL, but the data wasn't published using the Google/Bing/OSM tiling scheme. Not to worry: ALF, an Esri-aware redirect proxy, is here to help! (All the way from planet Melmac)

The goal of this application is to provide an Esri-aware proxy that allows the use of AGOL and ArcServer not published with the Google/Bing/OSM zoom levels to be used in tools/applications that expect the Google/Bing/OSM zoom levels and resolutions.

**NOTE:** ArcGIS Server supports Google/Bing/OSM zoom levels out of the box. The best course of action for supporting applications that require Google/Bing/OSM zoom levels may be to republish the service (or publish a new service) and select the `Bing tiling scheme`.

This application does the following:

1. Looks up the ArcGIS MapServer's LOD configuration
2. Compares the zoom level resolutions to the Google/Bing/OSM [web-map zoom levels](http://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer) 
3. Redirects the request with a 302 status code to the ArcGIS MapServer with the modified `z` level


To use:
-----------

1. visit: http://gisinc.github.io/arcgis-level-fixer/
2. Create a proxy/redirect url
3. Use the new url!
 
If you like it:
---

Donate to a pet charity to feed the hungry cats...
:smiley_cat::smile_cat::heart_eyes_cat::kissing_cat::smirk_cat::scream_cat::joy_cat:
