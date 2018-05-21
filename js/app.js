//A global map variable has been declared.
var map;
//initial function called when google maps key loads
function initMap() {
  //  a constructor to create a new map JS object. You can use the coordinates
  //the coordinates of my city are given as center
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 30.7333,
      lng: 76.7794
    },
    zoom: 13
  });
  largeInfowindow = new google.maps.InfoWindow();
  bounds = new google.maps.LatLngBounds();
  //call for our knockout view model
  ko.applyBindings(ViewModel());
}
//function called if map does not load
function iferror() {
  document.getElementById('map').innerHTML = "MAP FAILED TO LOAD";
};
//array containing all the information
locations = [{
  title: 'sukhna lake',
  location: {
    lat: 30.7421,
    lng: 76.8188
  },
  description: "It is a rainfed lake which was created in 1958,It is a great place to chill out on a weekend and also it is a very popular tourist destination in the city",
  id: "5204feb1498ed42a61bafb61",
  li: true
}, {
  title: 'elante mall',
  location: {
    lat: 30.7056,
    lng: 76.8013
  },
  description: "Elante Mall is a shopping mall in the city of Chandigarh in India. With the gross leasable area of 1,150,000 sq ft, it is the second largest shopping mall in Northern India and the third largest in India.",
  id: "5114cd90e4b06bb0ed15a97f",
  li: true
}, {
  title: 'panjab university',
  location: {
    lat: 30.7581,
    lng: 76.7684
  },
  description: "Panjab University a public collegiate university located in Chandigarh, India. It originated in 1882, but established in 1947, making it one of the oldest universities in India. Panjab University is ranked among the top institutions of higher education in India and in Asia.",
  id: "4c4ae6f0f7b49c74e81efdc1",
  li: true
}, {
  title: 'rock garden',
  location: {
    lat: 30.7267,
    lng: 76.7671
  },
  description: "The Rock Garden of Chandigarh is a sculpture garden in Chandigarh, India, also known as Nek Chand's Rock Garden after its founder Nek Chand, a government official who started the garden secretly in his spare time in 1957. Today it is spread over an area of 40 acres (161874.25 m²). It is completely built of industrial and home waste and thrown-away items.",
  id: "4b6fe660f964a5206dff2ce3",
  li: true
}, {
  title: 'barbeque nation',
  location: {
    lat: 30.7260,
    lng: 76.8053
  },
  description: "It is one of the best restaurants in the city.My personal favourite",
  id: "4bbf61eef353d13a29837e10",
  li: true
}, {
  title: 'amravati enclave',
  location: {
    lat: 30.7516,
    lng: 76.9110
  },
  description: "This is where i live",
  id: "52d17d6f498eb2f63089f168",
  li: true
}];
//knockout viewmodel
var ViewModel = function() {
  selectedloc = ko.observable(''); //knockout variable to store input value of drop down list
  var self = this;
  self.error = ko.observable(''); //knockout variable to store value if foursquare api does not load.
  self.markers = []; //markers array has been created
  /* This function populates the infowindow when the marker is clicked. We'll only allow
       one infowindow which will open at the marker that is clicked, and populate based
       on that markers position.*/
  self.populateInfoWindow = function(marker, infowindow) {
    //ajax call for foursquare api
    $.ajax({
      url: "https://api.foursquare.com/v2/venues/" + marker.id + '?client_id=AXB2OYATWNT5R15OTRWO2DZZ5ZX12M024Z2CFHGJRRDGH1BP&client_secret=KRPAWDFQHGUHT540DVMXTAL2FYSRXJE05UYJTNMQ51ZBZFQ0&v=20170429',
      dataType: "json",
      success: function(data) {
        var output = data.response.venue;
        marker.content = '<p>' + output.name + '</p>';
        marker.place = '<p>' + "latitude=" + output.location.lat + ",longitude=" + output.location.lng + '</p>';
        marker.checkin = '<p>' + "check_in_count=" + output.stats.checkinsCount + '</p>';
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
          infowindow.marker = marker;
          infowindow.setContent('<div>' + marker.content + marker.place + marker.checkin + marker.description + '</div>');
          infowindow.open(map, marker);
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
        }
      },
      error: function(e) {
        self.error("Foursquare Did'nt Load");
      }
    });
  };
  /*This function takes in a COLOR, and then creates a new marker
   icon of that color. The icon will be 21 px wide by 34 high, have an origin
   of 0, 0 and be anchored at 10, 34).*/
  self.makeMarkerIcon = function(markerColor) {
    var markerImage = new google.maps.MarkerImage('http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor + '|40|_|%E2%80%A2', new google.maps.Size(21, 34), new google.maps.Point(0, 0), new google.maps.Point(10, 34), new google.maps.Size(21, 34));
    return markerImage;
  };
  // default colour for marker
  var defaultIcon = makeMarkerIcon('0091ff');
  //when marker is clicked colour changes
  var highlightedIcon = makeMarkerIcon('FFFF24');
  //Create al markers
  for (i = 0; i < locations.length; i++) {
    // Get all the information from the location array.
    var position = locations[i].location;
    var title = locations[i].title;
    var description = locations[i].description;
    var id = locations[i].id;
    var li = locations[i].li;
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      id: id,
      li: ko.observable(li),
      description: description
    });
    // Push the marker to our array of markers.
    self.markers.push(marker);
    // Extend boundaries of map or each marker
    bounds.extend(marker.position);
    //  onclick event to open the large infowindow at each marker.
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
      bounds.extend(this.position);
    });
    // onclick event to change marker colour
    marker.addListener('click', function() {
      for (var i = 0; i < self.markers.length; i++) {
        if (self.markers[i].id != this.id) {
          self.markers[i].setIcon(defaultIcon);
        } else {
          self.markers[i].setIcon(highlightedIcon);
        }
      }
    });
  }
  map.fitBounds(bounds); // `bounds` is a `LatLngBounds` object
  //used for filteration,when a user clicks on a particular item this function is invoked
  self.change = function(data, event) {
    for (var i = 0; i < self.markers.length; i++) {
      if (self.markers[i].title == data.title) {
        self.populateInfoWindow(markers[i], largeInfowindow);
        markers[i].setIcon(highlightedIcon);
        bounds.extend(self.markers[i].position);
      } else {
        markers[i].setIcon(defaultIcon);
      }
    }
  };
  self.iferror = function() {
    document.getElementById('map').innerHTML = "MAP FAILED TO LOAD";
  };
  self.test = function(viewModel, event) {
    if (selectedloc().length === 0) {
      for (var i = 0; i < self.markers.length; i++) {
        self.markers[i].setMap(map);
        self.markers[i].li(true);
        markers[i].setIcon(defaultIcon);
        map.fitBounds(bounds);
      }
    } else {
      for (var j = 0; j < self.markers.length; j++) {
        if (self.markers[j].title.toLowerCase().indexOf(selectedloc().toLowerCase()) >= 0) {
          self.markers[j].setMap(map);
          self.markers[j].li(true);
          markers[j].setIcon(defaultIcon);
        } else {
          self.markers[j].setMap(null);
          self.markers[j].li(false);
          markers[j].setIcon(defaultIcon);
        }
      }
    }
    largeInfowindow.close();
  };
};