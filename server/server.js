
var url = "http://data.medicare.gov/resource/ee3i-x2ic.json?state=MN&measure=ED2&$where=sample>0";
res = Meteor.http.get(url);
for(var i=0; i<res.data.length; i++){
    var obj = res.data[i];
    var address = obj.address_1 + ", " + obj.city + ", " + obj.state + " " + obj.zip_code;
    console.log(address);
    var pt = geocode(address); 
    var hosp = {name: obj.name, 
                address: address,
                lat: pt[0], 
                lng:  pt[1]};
}
console.log("--- END --- ");


function geocode(address) {
    var response = HTTP.get(
 'https://maps.googleapis.com/maps/api/geocode/json',
        {params: { address : address,
				sensor : 'false'},
			contentType: JSON,
			headers: {Accept : 'application/xml','User-Agent':'Mozilla/5.0 Ubuntu/8.10 Firefox/3.0.4'}} );
    var json = JSON.parse(response.content);
var lat = json.results[0].geometry.location.lat;
    var lng =   json.results[0].geometry.location.lng;
    console.log(address + " -> " + lat + " " + lng);
				return [lat, lng];           
}

//The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
/*var options = {
    host: 'data.medicare.gov',
    path: '/resource/ee3i-x2ic.json?state=MN'
};

var callback = function (response) {
    var str = '';

    response.on('data', function (chunk) {
        str += chunk;
    });

  response.on('end', function () {
    console.log(str);
  });
}

http.request(options, callback).end();
*/