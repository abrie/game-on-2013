"use strict";

define(["domReady!"], function(doc) {
    var googleMapElement = document.getElementById("googleMap");
    var showGoogleMap = function(isVisible) {
        googleMapElement.style.visibility = isVisible ? "visible" : "hidden";
    }

    if (typeof google !== 'object' || typeof google.maps !== 'object') {
        console.log("Failed to load google maps api. Maps will not work.");
        return {
            show: function() { showGoogleMap(true); },
            hide: function() { showGoogleMap(false); }
        }
    }

    var myLatlng = new google.maps.LatLng(-25.363882,131.044922);

    var mapOptions = {
        center: new google.maps.LatLng(-34.397, 150.644),
        zoom: 1,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var googleMap = new google.maps.Map(
        document.getElementById("googleMap"),
        mapOptions);

    var marker = new google.maps.Marker({
        position: myLatlng,
        map: googleMap,
        title:"warphole #64"
    });

    return {
        activate: function() { showGoogleMap(true); },
        deactivate: function() { showGoogleMap(false); }
    }
});
