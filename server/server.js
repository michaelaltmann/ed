function loadAllHospitals() {
    var url = "http://data.medicare.gov/resource/ee3i-x2ic.json?state=MN&measure=ED2&$where=sample>0";
    res = Meteor.http.get(url);
    Hospitals.remove();
    for (var i = 0; i < res.data.length; i++) {
        var obj = res.data[i];
        var address = obj.address_1 + ", " + obj.city + ", " + obj.state + " " + obj.zip_code;
        try {
            var pt = geocode(address);
            var hosp = {
                name: obj.name,
                address: address,
                lat: pt[0],
                lng: pt[1]
            };
            Hospitals.insert(hosp);
        } catch (err) {
            console.error(err);
        }

    }
    console.log("--- END --- ");
}

function geocode(address) {
    var response = HTTP.get(
        'https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: address,
                sensor: 'false'
            },
            contentType: JSON,
            headers: {
                Accept: 'application/xml',
                'User-Agent': 'Mozilla/5.0 Ubuntu/8.10 Firefox/3.0.4'
            }
        });
    var json = JSON.parse(response.content);
    var lat = json.results[0].geometry.location.lat;
    var lng = json.results[0].geometry.location.lng;
    console.log(address + " -> " + lat + " " + lng);
    return [lat, lng];
}

function init() {
    loadAllHospitals();
}

Meteor.startup(init);