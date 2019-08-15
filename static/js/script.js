const MUST_FLY_TO_CURRENT_POS = false;

const urlParams = new URLSearchParams(window.location.search);
const target_wp = urlParams.has("towp") ? parseInt(urlParams.get('towp')) : null;

const lat = urlParams.has("lat") ? parseFloat(urlParams.get('lat')) : null;
const lng = urlParams.has("lng") ? parseFloat(urlParams.get('lng')) : null;
const friend_description = urlParams.has("friend") ? urlParams.get('friend') : null;
let computeFirstRoute = false;

var mymap = L.map('mapid', {
    scrollWheelZoom: false
}).setView([-2.144463, -79.967838], 18);
mymap.on('click', () => {
    mymap.scrollWheelZoom.enable();
});
mymap.on('mouseout', () => {
    mymap.scrollWheelZoom.disable();
});

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 20,
    id: 'mapbox.streets-satellite',
    accessToken: 'pk.eyJ1IjoiYWF2ZW5kYW4iLCJhIjoiY2p3NnVzdHozMjdxeDQzcXBnYjlwMTRqcyJ9.S00xReWyD9_Eb4B1h-VgIg'
}).addTo(mymap);

var greenIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
var redIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var markers;
var trueMarkers = [];
var areas;

$(document).ready(function () {
    $.ajax({
        url: "api/waypoints",
        success: function (data, status) {
            markers = data;
            if (target_wp != null) {
                computeFirstRoute = true;
            }

            for (let k in markers) {
                let marker = L.marker([markers[k].latitude, markers[k].longitude]).addTo(mymap);
                marker.bindPopup("<p>" + markers[k].name + "</p>" +
                    "<p><a href='#mapid' onclick='computeShortestRoute(" + markers[k].pk + ")'>¿Cómo llegar?</a></p>");
                trueMarkers.push(marker);

                // Only for admins! Show all routes with distances

            }
            mymap.fitBounds(new L.featureGroup(trueMarkers).getBounds(), {
                padding: L.point(20, 20)
            });
        }
    });

    $.ajax({
        url: "api/areas",
        success: function (areas, status) {
            for (let k in areas) {
                let circle = L.circle([areas[k].latitude, areas[k].longitude], {
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.2,
                    radius: 20
                }).addTo(mymap);
                circle.bindPopup(areas[k].name);
            }
        }
    });

    // Add friend marker if present
    if (lat != null) {
        let m = L.marker([lat, lng], {
            icon: redIcon
        }).addTo(mymap);
        m.bindPopup("<p>" + friend_description + " está aquí</p>");
        trueMarkers.push(m);
    }
});

var myCurrPosMarker = L.marker([0, 0], {
    icon: greenIcon
}).addTo(mymap);
myCurrPosMarker.bindPopup("Usted está aquí");
var myCurrPosMarkerPrecision = L.circle([0, 0], {
    color: "green",
    fillColor: "green",
    radius: 10
}).addTo(mymap);

var myCurrentPos = null;

// https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
function geoFindMe() {
    function success(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        myCurrentPos = position;

        myCurrPosMarker.setLatLng([latitude, longitude]);
        myCurrPosMarkerPrecision.setLatLng([latitude, longitude]);
        myCurrPosMarkerPrecision.setRadius(position.coords.accuracy);
        if (MUST_FLY_TO_CURRENT_POS && !mymap.getBounds().contains([latitude, longitude])) {
            mymap.flyTo([latitude, longitude]);
        }

        if (computeFirstRoute) { // HACK: delay first computation until after geolocation has been found
            computeFirstRoute = false;
            computeShortestRoute(target_wp);
        }
    }

    function error() {
        console.error('Unable to retrieve your location');
    }

    if (!navigator.geolocation) {
        console.error('Geolocation is not supported by your browser');
    } else {
        navigator.geolocation.getCurrentPosition(success, error, {
            enableHighAccuracy: true
        });
    }
}

window.setInterval(function () {
    geoFindMe();
}, 2000);

var route = null;
var toFirstWpRoute = null;

function computeShortestRoute(destinyId) {
    let destinyWp = markers.find(el => el.pk == '' + destinyId);
    if (myCurrentPos == null) {
        alert("¡No hay datos de geolocalización!\nNo se puede calcular la ruta más corta.");
        return;
    }

    var bestStart = getClosestWpIndex(myCurrentPos);

    var x = dijkstra(bestStart, markers.findIndex(el => el.pk == destinyId));
    var latlngs = toLatLong(x[0]);
    if (toFirstWpRoute != null) {
        toFirstWpRoute.remove();
    }
    if (route != null) {
        route.remove();
    }
    toFirstWpRoute = L.polyline([
        [myCurrentPos.coords.latitude, myCurrentPos.coords.longitude], latlngs[0]
    ], {
        color: 'red',
        dashArray: "10,15",
        weight: 5
    }).addTo(mymap);
    toFirstWpRoute.bindPopup("Vaya hasta " + markers[bestStart].name);
    route = L.polyline(latlngs, {
        color: 'red',
        weight: 5
    }).addTo(mymap);
    route.bindPopup("Distancia: " + x[1] + " metros");
    // zoom the map to the polyline
    mymap.fitBounds(route.getBounds());
    toFirstWpRoute.redraw();
    route.redraw();
}

function getClosestWpIndex(pos) {
    let shortestDist = Infinity;
    let closestWp = null;
    for (let wp in markers) {
        let dist = distance(
            markers[wp].latitude,
            markers[wp].longitude,
            myCurrentPos.coords.latitude,
            myCurrentPos.coords.longitude
        );
        if (dist < shortestDist) {
            shortestDist = dist;
            closestWp = wp;
        }
    }
    return closestWp;
}

function distance(lat1, lng1, lat2, lng2) {
    // WARN: Not correct for big distances!
    return Math.sqrt(Math.pow((lat1 - lat2), 2) + Math.pow((lng1 - lng2), 2));
}

function dijkstra(startIndex, endIndex) {
    var L = {};
    L[startIndex] = [0, null];

    var unknownMaxDistances = [];
    for (let m in markers) {
        unknownMaxDistances.push(parseInt(m));
        if (m != startIndex) {
            L[m] = [Infinity, null];
        }
    }

    while (unknownMaxDistances.includes(endIndex)) {
        let targetId = findMinUnknown(L, unknownMaxDistances);
        unknownMaxDistances.splice(unknownMaxDistances.indexOf(targetId), 1);
        var neighbors = getNeighbors(targetId);
        for (let neighbor of neighbors) {
            //neighbor.target_pk is ID, neighbor.distance is weight
            var neigh_index = markers.findIndex(el => el.pk == neighbor.target_pk);
            L[neigh_index][0] = Math.min(L[neigh_index][0], (L[targetId][0] == Infinity ? 0 : L[targetId][0]) + neighbor.distance);
            L[neigh_index][1] = L[neigh_index][0] < (L[targetId][0] + neighbor.distance) ? L[neigh_index][1] : targetId;
        }
    }

    // Now L contains enouch info to reconstruct the route
    return [buildRoute(L, endIndex, startIndex), L[endIndex][0]];
}

function findMinUnknown(distances, unknowns) {
    let minSeen = Infinity;
    let minIndex = -1;
    for (let i of unknowns) {
        if (distances[i][0] <= minSeen) {
            minSeen = distances[i][0];
            minIndex = i;
        }
    }
    return minIndex;
}

function getNeighbors(x) {
    var neighbors = [];
    for (let y of markers[x].neighbor_waypoints) {
        neighbors.push(y);
    }
    return neighbors;
}

function buildRoute(L, endIndex, startIndex) {
    var route = [endIndex];

    var prev_index = endIndex;
    while (prev_index != parseInt(startIndex)) {
        prev_index = L[prev_index][1];
        route.push(prev_index);
    }


    return route.reverse();
}

function toLatLong(nodes) {
    var toReturn = [];

    for (let node of nodes) {
        var trueNode = markers[node];
        toReturn.push([trueNode.latitude, trueNode.longitude]);
    }

    return toReturn;
}
