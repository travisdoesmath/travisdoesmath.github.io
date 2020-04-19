class Pendulum {
    
    constructor(opts) {
        // default values
        this.l1=1; 
        this.l2=1;
        this.m1=1;
        this.m2=1; 
        this.G=9.8
        this.theta1=0.49*Math.PI; 
        this.theta2=1.0*Math.PI;
        this.p1=0;
        this.p2=0;
        ['l1','l2','m1','m2','G','theta1','theta2','p1','p2'].map(k => opts[k] ? this[k] = opts[k] : null)
    }

    theta1dot(theta1, theta2, p1, p2) {
        return (p1*this.l2 - p2*this.l1*Math.cos(theta1 - theta2))/(this.l1**2*this.l2*(this.m1 + this.m2*Math.sin(theta1 - theta2)**2));
    }

    theta2dot(theta1, theta2, p1, p2) {
        return (p2*(this.m1+this.m2)*this.l1 - p1*this.m2*this.l2*Math.cos(theta1 - theta2))/(this.m2*this.l1*this.l2**2*(this.m1 + this.m2*Math.sin(theta1 - theta2)**2));
    }

    p1dot(theta1, theta2, p1, p2) {
        var A1 = (p1*p2*Math.sin(theta1 - theta2))/(this.l1*this.l2*(this.m1 + this.m2*Math.sin(theta1 - theta2)**2)),
            A2 = (p1**2*this.m2*this.l2**2 - 2*p1*p2*this.m2*this.l1*this.l2*Math.cos(theta1 - theta2) + p2**2*(this.m1 + this.m2)*this.l1**2)*Math.sin(2*(theta1 - theta2))/(2*this.l1**2*this.l2**2*(this.m1 + this.m2*Math.sin(theta1 - theta2)**2)**2);
        return -(this.m1 + this.m2)*this.G*this.l1*Math.sin(theta1) - A1 + A2;
    }

    p2dot(theta1, theta2, p1, p2) {
        var A1 = (p1*p2*Math.sin(theta1 - theta2))/(this.l1*this.l2*(this.m1 + this.m2*Math.sin(theta1 - theta2)**2)),
            A2 = (p1**2*this.m2*this.l2**2 - 2*p1*p2*this.m2*this.l1*this.l2*Math.cos(theta1 - theta2) + p2**2*(this.m1 + this.m2)*this.l1**2)*Math.sin(2*(theta1 - theta2))/(2*this.l1**2*this.l2**2*(this.m1 + this.m2*Math.sin(theta1 - theta2)**2)**2);
        return -this.m2*this.G*this.l2*Math.sin(theta2) + A1 - A2;

    }

    f(Z) {
        return [this.theta1dot(Z[0], Z[1], Z[2], Z[3]), this.theta2dot(Z[0], Z[1], Z[2], Z[3]), this.p1dot(Z[0], Z[1], Z[2], Z[3]), this.p2dot(Z[0], Z[1], Z[2], Z[3])];
    }

    RK4(tau) {
        var Y1 = this.f([this.theta1, this.theta2, this.p1, this.p2]).map(d => d*tau);
        var Y2 = this.f([this.theta1 + 0.5*Y1[0], this.theta2 + 0.5*Y1[1], this.p1 + 0.5*Y1[2], this.p2 + 0.5*Y1[3]]).map(d => d*tau);
        var Y3 = this.f([this.theta1 + 0.5*Y2[0], this.theta2 + 0.5*Y2[1], this.p1 + 0.5*Y2[2], this.p2 + 0.5*Y2[3]]).map(d => d*tau);
        var Y4 = this.f([this.theta1 + Y3[0], this.theta2 + Y3[1], this.p1 + Y3[2], this.p2 + Y3[3]]).map(d => d*tau);

        return [
            this.theta1 + Y1[0]/6 + Y2[0]/3 + Y3[0]/3 + Y4[0]/6,
            this.theta2 + Y1[1]/6 + Y2[1]/3 + Y3[1]/3 + Y4[1]/6,
            this.p1 + Y1[2]/6 + Y2[2]/3 + Y3[2]/3 + Y4[2]/6,
            this.p2 + Y1[3]/6 + Y2[3]/3 + Y3[3]/3 + Y4[3]/6,
        ]
    }

    evolve(t=0.005) {
        var nextState = this.RK4(t);
        this.theta1 = nextState[0];
        this.theta2 = nextState[1];
        this.p1 = nextState[2];
        this.p2 = nextState[3];
        return this.getCoords();
    }

    getCoords() {
        return {
            'x1':this.l1*Math.sin(this.theta1),
    		'y1':this.l1*Math.cos(this.theta1),
	    	'x2':this.l1*Math.sin(this.theta1) + this.l2*Math.sin(this.theta2),
		    'y2':this.l1*Math.cos(this.theta1) + this.l2*Math.cos(this.theta2)
        }
    }
}

export class PendulumPlayer {
    constructor(el) {
        this._pause = false;
        this.nPendulums = 30;
        this.pendulums = d3.range(this.nPendulums).map(x => new Pendulum({m2: 1 + 0.01*x/this.nPendulums, theta1:0.75*Math.PI}))

        this.width = 300;
        this.height = 300;

        d3.select(el).select('.exhibit-media-container')
            .style('background-color', 'white')

        d3.select(el).select('a')
            .on('mouseenter', () => { this._pause = false; this.play(); })
            .on('mouseout', () => { this.pause() });

        this.canvas = d3.select(el).select(".d3-target").append('canvas')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('position','absolute')
            .style('top', 0)
            .style('left', 0)

        this.svg = d3.select(el).select(".d3-target").append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('position','absolute')
            .style('top', 0)
            .style('left', 0)

        this.g = this.svg.append("g").attr("transform", "translate(" + this.width*.5 + "," + this.height*.5 + ")");
        this.color = d3.scaleSequential(d3.interpolateRainbow).domain([0, this.nPendulums]);

        this.svg.on('click', e => { 
            var mousePos = d3.mouse(svg.node()); 
            reset(mousePos);
        });

        this.context = this.canvas.node().getContext('2d');

        this.scale = d3.scaleLinear().domain([0,1]).range([0,100])

        this.path = d3.line()
            .x(function(d) { return this.scale(d.l1*Math.sin(d.theta1)+d.l2*Math.sin(d.theta2)); })
            .y(function(d) { return this.scale(d.l1*Math.cos(d.theta1)+d.l2*Math.cos(d.theta2)); })

        this.trailOpacity = 1;
        this.maxThetaDelta = 0;
        this.opacityScale = d3.scaleLinear().domain([0, 2*Math.PI]).range([1, 0])

        this.update();
        this.update();
    }

    update() {
        var oldCoords = this.pendulums.map(p => p.getCoords());

        this.pendulums.forEach(p => p.evolve());

        var coords = this.pendulums.map(p => p.getCoords());
        
        this.draw(oldCoords, coords);
    }

    draw(oldCoords, coords) {
        if (this.maxThetaDelta < 2*Math.PI) {
            this.maxThetaDelta = Math.max(this.maxThetaDelta, Math.abs(d3.max(this.pendulums, d => d.theta1) - d3.min(this.pendulums, d => d.theta1)))
            this.trailOpacity = this.opacityScale(this.maxThetaDelta)
            
            this.canvas.style('opacity', this.trailOpacity);
        }

        for (var i = coords.length - 1; i >= 0; i--) {
            this.context.beginPath();
            this.context.strokeStyle = this.color(i);
            this.context.lineWidth = 2;
            this.context.moveTo(this.scale(oldCoords[i].x2) + this.width/2, this.scale(oldCoords[i].y2) + this.height/2);
            this.context.lineTo(this.scale(coords[i].x2) + this.width/2, this.scale(coords[i].y2) + this.height/2);
            this.context.stroke();
        }

        var pendulum = this.g.selectAll(".pendulum").data(coords, function(d, i) { return i; })

        var pendulumEnter = pendulum.enter()
            .append("g").attr("class","pendulum")

        pendulumEnter.append("line").attr("class", "firstShaft shaft")
        pendulumEnter.append("line").attr("class", "secondShaft shaft")
        pendulumEnter.append("circle").attr("class", "firstBob bob").attr("r",3)
        pendulumEnter.append("circle").attr("class", "secondBob bob").attr("r",7)

        var shaft1 = pendulum.select(".firstShaft")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", d => this.scale(d.x1))
            .attr("y2", d => this.scale(d.y1))
            .attr('stroke', (d, i) => d3.color(this.color(i)))

        var shaft2 = pendulum.select(".secondShaft")
            .attr("x1", d => this.scale(d.x1))
            .attr("y1", d => this.scale(d.y1))
            .attr("x2", d => this.scale(d.x2))
            .attr("y2", d => this.scale(d.y2))
            .attr('stroke', (d, i) => d3.color(this.color(i)))

        var bob1 = pendulum.select(".firstBob")
            .attr("cx", d => this.scale(d.x1))
            .attr("cy", d => this.scale(d.y1))
            .attr('fill', (d, i) => d3.color(this.color(i)))
            .attr('opacity', 1)
        var bob2 = pendulum.select(".secondBob")
            .attr("cx", d => this.scale(d.x2))
            .attr("cy", d => this.scale(d.y2))
            .attr('fill', (d, i) => d3.color(this.color(i)))
            .attr('stroke', (d, i) => d3.color(this.color(i)).darker())
            .attr('stroke-width', 2)
    }

    reset(mousePos) {
        var theta1 = 0.5*Math.PI + Math.atan2(height/2 - mousePos[1], mousePos[0] - width/2)
        this.trailOpacity = 1;
        this.maxThetaDelta = 0;
        this.pendulums = d3.range(this.nPendulums).map(x => new Pendulum({m2: 1 + 0.01*x/this.nPendulums, theta1:theta1}));
        this.context.clearRect(0, 0, this.width, this.height);
    }

    play() {
        if (!this._pause) {
            this.update();
            setTimeout(() => { this.play(); }, 2);
        }        
    }

    pause() {
        this._pause = true;
    }
}











// var run = setInterval(() => { update() }, 2);


