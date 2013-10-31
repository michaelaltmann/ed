Template.hello.greeting = function () {
    return "Welcome to ed.";
};

Template.hello.events({
    'click input' : function () {
        // template data, if any, is available in 'this'
        loadSites();
        drawDiagram();
    }
});

Meteor.subscribe("hospitals");

var width = 960,
    height = 500,
    minlat = 40, maxlat=47,
    minlng = -94, maxlng = -93;

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

var canvas ;
var context;
var sites;

function scale(pt) {
    x = (width) * (pt[0]-minlat) / (maxlat - minlat);
    y = height * (pt[1] - minlng) / (maxlng - minlng);
    retur [x,y];
}

function readOne (hospital) {
    //TODO: Rescale boundingbox to view port
    sites.push(scale([hospital.lat,hospital.lng]));
}
function loadSites() { 
    sites = [];
    var iterator = Hospitals.find();
    iterator.forEach(readOne);
}


//d3.range(100).map(function(d) {
//        return [Math.random() * width, Math.random() * //height];
//    });


function drawDiagram() {
    canvas = d3.select("body").append("canvas")
    .attr("width", width)
    .attr("height", height)
    .on("mousemove", function() { sites[0] = d3.mouse(this); redraw(); });
    
    context = canvas.node().getContext("2d");
    
    redraw();
}              

function redraw() {
    var cells = voronoi(sites);
    
    context.clearRect(0, 0, width, height);
    
    context.fillStyle = "yellow";
    draw(cells[0]);
    context.fill();
    
    for (var k = 0, l = colors.length; k < l; ++k) {
        context.fillStyle = colors[k];
        for (var i = 1, n = cells.length; i < n; ++i) {
            if (i % l === k && draw(cells[i])) context.fill();
        }
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


