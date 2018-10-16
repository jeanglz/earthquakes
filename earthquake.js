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
                data.earthquakes.forEach(e => addMarker(e));
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
        markers.push(marker);
    }
}

