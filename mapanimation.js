var map;
var markers = [];

// load map
function init(){
	var myOptions = {
		zoom      : 15,
		center    : { lat:42.3639,lng:-71.0639},
		mapTypeId : google.maps.MapTypeId.ROADMAP
	};
	var element = document.getElementById('map');
  	map = new google.maps.Map(element, myOptions);
  	addMarkers();
}

// Add bus markers to map
async function addMarkers(){
	// get bus data
	var locations = await getBusLocations();

	// loop through data, add bus markers
	locations.forEach(function(bus){
		var marker = getMarker(bus.id);		
		if (marker){
			moveMarker(marker,bus);
		}
		else{
			addMarker(bus);			
		}
	});

	// timer
	console.log(new Date());
	setTimeout(addMarkers,15000);
}

// Request bus data from MBTA
async function getBusLocations(){
	var url = 'https://api-v3.mbta.com/vehicles?include=route&filter[direction_id]=1&filter[route_type]=1,3&include=trip&api_key=97121d90a25141a68e1940090ba5e176';	
	var response = await fetch(url);
	var json     = await response.json();
	return json.data;
}

async function addMarker(bus){
	var icon = await getIcon(bus);
	var marker = new google.maps.Marker({
	    position: {
	    	lat: bus.attributes.latitude, 
	    	lng: bus.attributes.longitude
	    },
	    map: map,
	    icon: icon,
	    id: bus.id
	});
	markers.push(marker);
}

async function getIcon(bus){
	// select icon basedon the ID make another call to get the type
	var routeType = await getRouteType(bus.relationships.route.data.id);

	if (routeType.attributes.description === 'Rapid Transit') {
		return './metro_24.png';
	}
	return './bus_24.png';	
}

//function that gets the roue type information based on the ID
async function getRouteType(routeID){

	var url = 'https://api-v3.mbta.com/routes/'+`${routeID}`+'?fields[route]=description&api_key=97121d90a25141a68e1940090ba5e176'
	var response = await fetch(url);
	var json     = await response.json();
	
	return json.data;

}

function moveMarker(marker,bus) {
	// change icon if bus has changed direction
	var icon = getIcon(bus);
	marker.setIcon(icon);

	// move icon to new lat/lon
    marker.setPosition( {
    	lat: bus.attributes.latitude, 
    	lng: bus.attributes.longitude
	});
}

function getMarker(id){
	var marker = markers.find(function(item){
		return item.id === id;
	});
	return marker;
}

window.onload = init;