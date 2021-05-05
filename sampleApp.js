const my_apiKey = "API_KEY" // please add your api key
var platform = new H.service.Platform({'apikey': my_apiKey});
// Obtain the default map types from the platform object:
var defaultLayers = platform.createDefaultLayers();

// Get an instance of the geocoding service:
var searchService = platform.getSearchService();

var routeService = platform.getRoutingService(null, 8);


function Mymap(){
    this.container = 'mapContainer';
    this.mapObj = {};
    this.markerGroup = {};
    this.addDefaultBehaviours = function() {
        // Create the default UI:
        H.ui.UI.createDefault(this.mapObj, defaultLayers);  

        // Enable the event system on the map instance:
        var mapEvents = new H.mapevents.MapEvents(this.mapObj);
        // Instantiate the default behavior, providing the mapEvents object:
        new H.mapevents.Behavior(mapEvents);

        this.markerGroup = new H.map.Group();  
        // Add the group to the map object (created earlier):
        this.mapObj.addObject(this.markerGroup);
    };
 
    this.addMarkerAt = function (lt,ln) {
        this.addMarkerAtPos({ lat: lt, lng: ln })
    }

    this.addMarkerAtPos = function (pos) {
        // Create a marker:
        var marker = new H.map.Marker(pos);
        // Add the marker to the group (which causes 
        // it to be displayed on the map)
        this.markerGroup.addObject(marker);
        
    }

    this.initializeMap = function (){
        this.mapObj = new H.Map(
            document.getElementById(this.container),
            defaultLayers.vector.normal.map,
            {
            zoom: 10,
            center: { lat: 19.19172, lng: 72.84222 }
            }); 
          
        this.addDefaultBehaviours();  
    };
}

const customMap = new Mymap()
function startLoader(){
    document.getElementById("loader").style.display="block" 
}

function stopLoader(){
    document.getElementById("loader").style.display="none" 
}

function displayAddr(addr) {
   startLoader();
   searchService.geocode({
       q: addr
   }, (result) => {
       result.items.forEach((item) => {
           customMap.addMarkerAtPos(item.position)
           stopLoader();
       });
   },alert);
}

async function displayRoute(src,dest) {
    startLoader();
    const onError = (err) => {alert("error :" + err);stopLoader()}
    const onSearchResult = (res) => {return res.items[0].position}
    var res = await searchService.geocode({ q: src });
    startPos = res.items[0].position
    console.log('got start position as : ' + JSON.stringify(startPos))
    res = await searchService.geocode({ q: dest });
    var endPos = res.items[0].position
    console.log('got end position as : ' + JSON.stringify(endPos))
   
    // Create the parameters for the routing request:
    var routingParameters = {
        'routingMode': 'fast',
        'transportMode': 'car',
        // The start point of the route:
        'origin': startPos.lat + "," + startPos.lng,
        // The end point of the route:
        'destination': endPos.lat + "," + endPos.lng,
        // Include the route shape in the response
        'return': 'polyline,summary'
        };
    
    const onRouteResult = (result) => {
        // ensure that at least one route was found
        if (result.routes.length) {
            customMap.markerGroup.removeAll();
            result.routes[0].sections.forEach((section) => {
                document.getElementById("info").innerText = section.summary['duration'] + "seconds;  " + section.summary['length'] + "meters";
            
                // Create a linestring to use as a point source for the route line
                let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);

                // Create a polyline to display the route:
                let routeLine = new H.map.Polyline(linestring, {
                style: { strokeColor: 'blue', lineWidth: 8, lineTailCap: 'arrow-tail',lineHeadCap: 'arrow-head' }
                });

                var routeArrows = new H.map.Polyline(linestring, {
                    style: {
                      lineWidth: 6,
                      fillColor: 'white',
                      strokeColor: 'rgba(255, 255, 255, 1)',
                      lineDash: [0, 3],
                      lineTailCap: 'arrow-tail',
                      lineHeadCap: 'arrow-head' }
                    }
                  );

                let starticon = new H.map.Icon('./redpin.png');
                // Create a marker for the start point:
                let startMarker = new H.map.Marker(section.departure.place.location,{icon: starticon});

                let endicon = new H.map.Icon('./yellowflag.png');
                // Create a marker for the end point:
                let endMarker = new H.map.Marker(section.arrival.place.location,{icon: endicon});

                customMap.markerGroup.addObjects([routeLine, routeArrows, startMarker, endMarker])
                // // Add the route polyline and the two markers to the map:
                // map.addObjects([routeLine, startMarker, endMarker]);

                // Set the map's viewport to make the whole route visible:
                customMap.mapObj.getViewModel().setLookAtData({bounds: routeLine.getBoundingBox()});
                stopLoader();
            });
        }   }; 

    routeService.calculateRoute(routingParameters, onRouteResult,onError);

}
