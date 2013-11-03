Template.hello.greeting = function () {
    return "Welcome to ed.";
};

Template.hello.events({
    'click input': function () {
        // template data, if any, is available in 'this'
        loadMap();
        loadPoints();
        drawDiagram();
    }
});

Meteor.subscribe("hospitals");

var width = 600,
    height = 500,
    maxRate = 60;

var bBox = [[43.5, -97],[49, -91]];


var canvas;
var context;
var sites, siteMap;
var svg;

var projection;
var voronoi;

function init() {
    projection = d3.geo.albers()
        .center([0, 46])
        .rotate([94, 0])
        .parallels([43, 49])
        .scale(5000)
        .translate([width / 2, height / 2]);
    voronoi = d3.geom.voronoi();
    voronoi.clipExtent(bBox);
}
Meteor.startup(init);

function readOnePoint(hospital) {
    var pt = [hospital.lat, hospital.lng];
    if (pt != null && pt.length == 2) {
        if (siteMap[pt] != null) {
            alert("Skipping dup: " + pt);
        } else {
            siteMap[pt] = hospital;
            sites[sites.length] = pt;
        }
    }
}

function createSvg() {
    if (svg == null) {
        svg = d3.select("body").append("svg")
            .attr("overflow", "hidden")
            .attr("width", width)
            .attr("height", height);
    }
}

function loadMap() {
    createSvg();
    d3.json("example-data/mn-county-2010.geo.json", function (error, mn) {
        var path = d3.geo.path()
            .projection(projection);
        svg.append("path")
            .datum({
                type: "FeatureCollection",
                features: mn.features
            })
            .attr("class", "map")
            .attr("d", path);
    });
}

function loadPoints() {
    var iterator = Hospitals.find();
    sites = [];
    siteMap = {};
    iterator.forEach(readOnePoint);
}


function drawDiagram() {
    redraw();
}

function redraw() {
    createSvg();
    var cells = voronoi(sites);


    for (var i = 0, n = cells.length; i < n; ++i) {
        var cell = cells[i];
        var screenPt = cell.point;
        hospital = siteMap[screenPt];
        console.log("rate " + hospital.rate);
        var level = Math.floor(hospital.rate * 16 / maxRate);
        if (level < 0) level = 0;
        if (level > 15) level = 15;
        var style = "cell" + level;
        draw(cell, style);
    }
}

function cellToFeature(cell) {
    var coordinates = [];
    console.log("----");
    // Need to reverse the order because 
    // D3 geom wants them in clockwise order
    for (var j = cell.length - 1; j >= 0; j--) {
        var lat = cell[j][1],
            lng = cell[j][0];
        var point = [lat, lng];
        console.log(point);
        coordinates[coordinates.length] = point;
    }
    var feature = {
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [coordinates]
        },
        "properties": {}
    }
    return feature;
}

function draw(cell, style) {
    var feature = cellToFeature(cell);
    var path = d3.geo.path()
        .projection(projection);
    svg.append("path")
        .datum(feature)
        .attr("class", style)
        .attr("d", path);
}