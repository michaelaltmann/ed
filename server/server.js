// On the server
var url = "http://data.medicare.gov/resource/ee3i-x2ic.json?state=MN&measure=ED2&$where=sample>0";
res = Meteor.http.get(url);
for(var i=0; i<res.data.length; i++){
    var obj = res.data[i];
    var address = obj.address_1 + ", " + obj.city + ", " + obj.state + " " + obj.zip_code;
    console.log(address);
}
console.log("--- END--- ");

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