    width = 300;
    height = 300;

var canvas = d3.select('#pendulum').select(".d3-target").append("canvas")
    .attr('width', width)
    .attr('height', height)
    .style('position', 'absolute')
    .style('top', 0)
    .style('left', 0)
var context = canvas.node().getContext('2d');
context.rect(0, 0, width, width)
context.fillStyle = 'white';
context.fill();

var svg = d3.select('#pendulum').select(".d3-target").append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('position', 'absolute')
    .style('top', 0)
    .style('left', 0)
    //width = +svg.style("width"),
    //height = +svg.style("height"),
    g = svg.append("g")
    // .attr("transform", "translate(" + width*.5 + "," + height*.5 + ")");
    color = d3.scaleSequential(d3.interpolateRainbow).domain([0, nPendula]);

var xScale = d3.scaleLinear().domain([-1.5,1.5]).range([0, width])
var yScale = d3.scaleLinear().domain([-1.5,1.5]).range([-width* 1/10, width * 9/10])
var scale2 = d3.scaleLinear().domain([0,1]).range([0, 100])

var oldZs = Zs;

var path = d3.line()
    .x(function(d) { return xScale(l1*Math.sin(d[0])+l2*Math.sin(d[1])); })
    .y(function(d) { return yScale(l1*Math.cos(d[0])+l2*Math.cos(d[1])); })

var update = function(Zs, oldZs) {
    var coords = Zs.map(Z=>getCoords(Z)),
        oldCoords = oldZs.map(Z=>getCoords(Z));

    for (var i = coords.length - 1; i >= 0; i--) {
        context.beginPath();
        context.strokeStyle = color(i);
        context.lineWidth = 2;
        context.moveTo(xScale(oldCoords[i].x2), yScale(oldCoords[i].y2));
        context.lineTo(xScale(coords[i].x2), yScale(coords[i].y2));
        context.stroke();
    }

    var pendulum = g.selectAll(".pendulum").data(coords, function(d, i) { return i; })

    var pendulumEnter = pendulum.enter()
        .append("g").attr("class","pendulum")

    pendulumEnter.append("line").attr("class", "firstShaft shaft")
    pendulumEnter.append("line").attr("class", "secondShaft shaft")
    pendulumEnter.append("circle").attr("class", "firstBob bob").attr("r",3)
    pendulumEnter.append("circle").attr("class", "secondBob bob").attr("r",3)

    var shaft1 = pendulum.select(".firstShaft")
        .attr("x1", xScale(0))
        .attr("y1", yScale(0))
        .attr("x2", function(d) { return +xScale(d.x1); })
        .attr("y2", function(d) { return +yScale(d.y1); })

    var shaft2 = pendulum.select(".secondShaft")
        .attr("x1", function(d) { return +xScale(d.x1); })
        .attr("y1", function(d) { return +yScale(d.y1); })
        .attr("x2", function(d) { return +xScale(d.x2); })
        .attr("y2", function(d) { return +yScale(d.y2); })

    var bob1 = pendulum.select(".firstBob")
        .attr("cx",function(d) { return +xScale(d.x1); })
        .attr("cy",function(d) { return +yScale(d.y1); })
    var bob2 = pendulum.select(".secondBob")
        .attr("cx",function(d) { return +xScale(d.x2); })
        .attr("cy",function(d) { return +yScale(d.y2); })

}

var run;

function evolve() {
    update(Zs, oldZs); oldZs = Zs; Zs = Zs.map(Z=>RK4(Z, f, 0.005));
}

evolve();
evolve();

d3.select('#pendulum')
.on('mouseover', function() {
    run = setInterval( evolve, 4);
}).on('mouseout', function() {
    clearInterval(run);
})
