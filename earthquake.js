function initMap() {
    let markers = [];

    let map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 19.4978, lng: -99.1269},
      zoom: 4
    });
    
    let input = document.getElementById('pac-input');
    
    // Restrict autocomplete to only show cities.
    let options = {
        types: ['(cities)']
    };
    let autocomplete = new google.maps.places.Autocomplete(input, options);

    autocomplete.addListener('place_changed', function() {
      
      let place = autocomplete.getPlace();
      if (!place.geometry) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        window.alert("No details available for input: '" + place.name + "'");
        return;
      }

      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
        
        // get the bounding box for the entered city
        let bBox = place.geometry.viewport.toJSON();
    
        // Remove previously added markers
        markers.forEach(m => m.setMap(null));

        // get the earthquakes list using geonames api.
        let eqsUrl = 'http://api.geonames.org/earthquakesJSON?north='+bBox.north+'&south='+bBox.south+'&east='+bBox.east+'&west='+bBox.west+'&username=jeanbo';        
        $.getJSON(eqsUrl, function(data) {
            if((data.earthquakes === undefined || data.earthquakes.length === 0)){
                alert("No earthquakes found");
            }else{
                // Add a marker for each earthquake
                data.earthquakes.slice(-10).forEach(e => addMarker(e));
            }
        })
        .fail(function() {
            console.log( "There was an error trying to find earthquakes in the specified city" );
        });

      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(17);
      }

    });
  
    function addMarker(earthquake){
        let marker = new google.maps.Marker({
            position: { lat: earthquake.lat, lng: earthquake.lng },
            map: map,
            title: 'Earthquake datetime: '+ earthquake.datetime
        });

        let formattedDate = new Date(earthquake.datetime);
        let infowindow = new google.maps.InfoWindow({
            content: `<h6><b>Date of earthquake:</b> ${formattedDate}</h6>
                <h6><b>Depth:</b> ${earthquake.depth}</h6>
                <h6><b>Lat:</b> ${earthquake.lat}</h6>
                <h6><b>Lng:</b> ${earthquake.lng}</h6>
                <h6><b>Magnitude:</b> ${earthquake.magnitude}</h6>`
        });

        marker.addListener('click', function() {
            infowindow.open(map, marker);
        });

        markers.push(marker);
    }
}

getLargestEarthquakes();

function getLargestEarthquakes(){
    // Get dates to limit web service results
    let d = new Date();
    let year = d.getFullYear();
    let month = ('0' + (d.getMonth()+1)).slice(-2);
    let day = d.getDate();
    let todaysDate = year+'-'+month+'-'+day;
    let oneYearAgo = (year-1)+'-'+month+'-'+day;

    let eqsUrl = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime='+oneYearAgo+'&endtime='+todaysDate+'&minmagnitude=5';        
    $.getJSON(eqsUrl, function(data) {
        // Order earthquakes events by magnitude
        let sortedEarthquakes = data.features.sort((a, b) => b.properties.mag - a.properties.mag);

        // Get the top 10 largest earthquakes
        let top10Largest = sortedEarthquakes.slice(0, 10);
        
        // Add earthquakes to list in the side bar
        let count = 1;
        top10Largest.forEach(e => {
            $('#largest-eqs-list').append(
                `<li>
                    <a target="_blank" href="${e.properties.url}">
                        ${count++}.- ${e.properties.place} <br>
                    <a>
                    <p>magnitude: ${e.properties.mag}</p>
                </li>`);
        });
    })
    .fail(function() {
        console.log( "There was an error getting trying to retrieve the earthquakes info." );
    });

}
