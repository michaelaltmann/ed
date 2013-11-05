function loadMeasureDescriptions() {
    Measures.remove({});
    Measures.insert({name:"ED1", description: "Median time in minutes from emergency department arrival to emergency department departure for admitted emergency department patients", sort: 1 });
    Measures.insert({name:"ED2", description: "Admit decision time to emergency department departure time for admitted patients", sort: 2 });
    Measures.insert({name:"OP 18", description: "Median time in minutes from emergency department arrival to emergency department departure for discharged emergency department patients", sort: 3 });
    Measures.insert({name:"Door to diagnostic eval", description: "Time in minutes from door to diagnostic evaluation by a qualified medical professional", sort: 4});
    Measures.insert({name:"Median time to pain med", description: "Average time in minutes patients who came to the emergency department with broken bones had to wait before receiving pain medication", sort: 5 });
    Measures.insert({name:"Left before being seen", description: "Percentage of patients who left the emergency department before being seen", sort: 6 });
    Measures.insert({name:"Head CT results", description: "Percentage of patients who came to the emergency department with stroke symptoms who received brain scan results within 45 minutes of arrival", sort: 7 });    
}

function addMeasure(name, value) {
    name = name.trim();
    var selector = {name: name};
    var existing = Measures.find(selector);
    var m;
    if (existing.count() == 0) {
        m = {name: name, min: 1000, max: 0};
        Measures.insert(m);
    } else {
        console.log("Name >"+name+"< found " + existing.count());
        m = existing.fetch()[0];
    } 
    if (m.min == null) m.min = 1000;
    if (m.max == null) m.max = 0;
    if (value < m.min) m.min = value;
    if (value > m.max) m.max = value;
    Measures.update(selector, m);
}

function loadAllHospitals() {
    var url = "http://data.medicare.gov/resource/ee3i-x2ic.json?state=MN&$where=sample>0";
    res = Meteor.http.get(url);
    var previouslyLoaded = 0;
    var newlyLoaded = 0;
    for (var i = 0; i < res.data.length; i++) {
        var obj = res.data[i];
        var selector = {
            provider_id: obj.provider_id
        };
        var existing = Hospitals.find(selector);
        var hosp;
        if (existing.count() == 0) {
            hosp = {
                provider_id : obj.provider_id,
                name : obj.hospital_name,
                measures : {}
            };
            hosp.address =  obj.address_1 + ", " + obj.city + ", " + obj.state + " " + obj.zip_code;
            try {
                var pt = geocode(hosp.address);
                hosp.lat = pt[0];
                hosp.lng = pt[1];
                Hospitals.insert(hosp);
                newlyLoaded++;
            } catch (err) {
                console.error(err);
            }
        } else {
            hosp = existing.fetch()[0];
            previouslyLoaded++;
        }
//        console.log(hosp.provider_id + "." + obj.measure + " = " + obj.rate);
        addMeasure(obj.measure, parseInt(obj.rate));
        hosp.measures[obj.measure] = obj.rate;
        Hospitals.update(selector, hosp);
    }
    console.log("newlyLoaded: " + newlyLoaded 
               + ", previouslyLoaded: " + previouslyLoaded);
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
    loadMeasureDescriptions();
    loadAllHospitals();
}

Meteor.startup(init);