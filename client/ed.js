Template.main.events({
    "click .carouselSlide": function (evt) {
        var measureName = $(evt.target).attr("data-name");
        measure = Measures.find({
            name: measureName
        }).fetch()[0];
        loadMap();
        loadPoints();
        drawDiagram();
    }
});

Template.main.measures = function () {
    return Measures.find({}, {sort: {sort: 1}});
}

Meteor.subscribe("hospitals");

var width = 600,
    height = 500,
    maxRate = 60;
var measure = "ED2";
var bBox = [[43.5, -97], [49, -91]];


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
        svg = d3.select("#map").append("svg")
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
        var rate = hospital.measures[measure.name];
        console.log("rate " + rate);
        var level, label;
        if (rate == null) {
            level = -1;
            label = hospital.name + " NA";
        } else {
            // looks beter not to use level 0
            level = 1+ Math.floor((rate - measure.min) * 15 / (measure.max - measure.min));
            if (level < 1) level = 1;
            if (level > 15) level = 15;
            if (measure.higherIsBetter) {
                level = 1 + (15-level);
            }
            label = hospital.name + " " + rate;
        }
        var style = "cell" + level;
        draw(cell, style, label);
    }
}

function cellToFeature(cell) {
    var coordinates = [];
    console.log("----");
    // Need to reverse the order because 
    // D3 geom wants them in clockwise order
    for (var j = cell.length - 1; j >= 0; j--) {
        coordinates[coordinates.length] = cell[j].reverse();
    }
    //complete the loop of the polygon
    coordinates[coordinates.length] = coordinates[0];

    var cellFeature = {
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [coordinates]
        },
        "properties": {}
    }
    return cellFeature;
}

function draw(cell, style, label) {
    var cellFeature = cellToFeature(cell);
    var path = d3.geo.path()
        .projection(projection);
    svg.append("path")
        .datum(cellFeature)
        .attr("class", style)
        .attr("d", path)
        .append("svg:title").text(label)
       ;

    var p = projection(cell.point.reverse());
    svg.append("circle")
        .attr("class", "hospital")
        .attr("cx", p[0])
        .attr("cy", p[1])
        .attr("r", 2);        
}