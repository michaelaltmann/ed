Template.hello.greeting = function () {
    return "Welcome to ed.";
};

Template.hello.events({
    'click input': function () {
        // template data, if any, is available in 'this'
        loadPoints();
        drawDiagram();
    }
});

Meteor.subscribe("hospitals");

var width = 960,
    height = 500,
    minlat = 42.3,
    maxlat = 47.5,
    minlng = -96.3,
    maxlng = -91.1,
    maxRate = 200;

var colors = [
    "rgb(197,27,125)",
    "rgb(222,119,174)",
    "rgb(241,182,218)",
    "rgb(253,224,239)",
    "rgb(247,247,247)",
    "rgb(230,245,208)",
    "rgb(184,225,134)",
    "rgb(127,188,65)",
    "rgb(77,146,33)"
];


var voronoi = d3.geom.voronoi();

var canvas;
var context;
var sites, siteMap;

function scale(pt) {
    x = width * (pt[1] - minlng) / (maxlng - minlng);
    if (x < 0) x = 0;
    if (x > width) x = width;
    y = height * (pt[0] - minlat) / (maxlat - minlat);
    if (y < 0) y = 0;
    if (y > height) y = height;
    return [x, y];
}

function readOnePoint(hospital) {
    var screenPt = scale([hospital.lat, hospital.lng]);
    if (screenPt != null && screenPt.length == 2) {
        if (siteMap[screenPt] != null) {
            alert("Skipping dup: " + screenPt);
        } else {
            var red = hospital.rate * 255 / maxRate;
            hospital.style = "rgb(" + red + ",0,0)";     
            siteMap[screenPt] = hospital;
            sites[sites.length] = screenPt;
        }
    }
}

function loadPoints() {
    var iterator = Hospitals.find();
    sites = [];
    siteMap = {};
    iterator.forEach(readOnePoint);
}


function drawDiagram() {
    canvas = d3.select("body").append("canvas")
        .attr("width", width)
        .attr("height", height);

    context = canvas.node().getContext("2d");

    redraw();
}

function redraw() {
    var cells = voronoi(sites);

    context.clearRect(0, 0, width, height);

    for (var i = 0, n = cells.length; i < n; ++i) {
        var cell = cells[i];
        var screenPt = cell.point;
        hospital = siteMap[screenPt];
        context.fillStyle = hospital.style;
        if (draw(cell)) context.fill();
    }


    context.strokeStyle = "white";
    for (var i = 0, n = cells.length; i < n; ++i) {
        if (draw(cells[i])) context.stroke();
    }

    context.fillStyle = "black";
    for (var i = 1, n = sites.length, site; i < n; ++i) {
        site = sites[i];
        context.beginPath();
        context.arc(site[0], site[1], 1.5, 0, 2 * Math.PI, false);
        context.fill();
    }
}

function draw(cell) {
    if (cell) {
        context.beginPath();
        context.moveTo(cell[0][0], cell[0][1]);
        for (var j = 1, m = cell.length; j < m; ++j) {
            context.lineTo(cell[j][0], cell[j][1]);
        }
        context.closePath();
        return true;
    }
}