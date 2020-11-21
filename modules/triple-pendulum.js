class TriplePendulum {
    
    constructor(opts) {
        this.G=9.8
        this.theta1=0.75*Math.PI; 
        this.theta2=0.75*Math.PI;
        this.theta3=0.75*Math.PI;
        this.theta1dot=0; 
        this.theta2dot=0;
        this.theta3dot=0;
        ['G','theta1','theta2','theta3','theta1dot','theta2dot','theta3dot'].map(k => opts[k] ? this[k] = opts[k] : null)
    }

    A(theta1 = this.theta1, theta2 = this.theta2, theta3 = this.theta3) {
        return [
            [1, 2/3 * Math.cos(theta1 - theta2), 1/3 * Math.cos(theta1 - theta3)],
            [Math.cos(theta2 - theta1), 1, 1/2 * Math.cos(theta2 - theta3)],
            [Math.cos(theta3 - theta1), Math.cos(theta3 - theta2), 1]
        ];
    }

    Ainv(theta1 = this.theta1, theta2 = this.theta2, theta3 = this.theta3) {
        return math.inv(this.A(theta1, theta2, theta3))
    }

    B(theta1 = this.theta1, theta2 = this.theta2, theta3 = this.theta3, theta1dot = this.theta1dot, theta2dot = this.theta2dot, theta3dot = this.theta3dot) {
        var G = this.G;
        return [
            2/3 * Math.sin(theta2 - theta1) * theta2dot ** 2 + 1/3 * Math.sin(theta3 - theta1) * theta3dot ** 2 - G * Math.sin(theta1),
            Math.sin(theta1 - theta2) * theta1dot ** 2 + 0.5 * Math.sin(theta3 - theta2) * theta3dot ** 2 - G * Math.sin(theta2),
            Math.sin(theta1 - theta3) * theta1dot ** 2 + Math.sin(theta2 - theta3) * theta2dot ** 2 - G * Math.sin(theta3)
        ]
    }

    lagrange_rhs([theta1 = this.theta1, theta2 = this.theta2, theta3 = this.theta3, theta1dot = this.theta1dot, theta2dot = this.theta2dot, theta3dot = this.theta3dot]) {
        var AinvB = math.multiply(this.Ainv(theta1, theta2, theta3), this.B(theta1, theta2, theta3, theta1dot, theta2dot, theta3dot))
        return [theta1dot, theta2dot, theta3dot, AinvB[0], AinvB[1], AinvB[2]]
    }

    time_step(dt) { 
        var y = [this.theta1, this.theta2, this.theta3, this.theta1dot, this.theta2dot, this.theta3dot]
        
        var k1 = this.lagrange_rhs(y)
        var k2 = this.lagrange_rhs([
            y[0] + 0.5 * dt * k1[0], 
            y[1] + 0.5 * dt * k1[1], 
            y[2] + 0.5 * dt * k1[2], 
            y[3] + 0.5 * dt * k1[3],
            y[4] + 0.5 * dt * k1[4],
            y[5] + 0.5 * dt * k1[5]
        ])
        var k3 = this.lagrange_rhs([
            y[0] + 0.5 * dt * k2[0], 
            y[1] + 0.5 * dt * k2[1], 
            y[2] + 0.5 * dt * k2[2], 
            y[3] + 0.5 * dt * k2[3],
            y[4] + 0.5 * dt * k2[4],
            y[5] + 0.5 * dt * k2[5]
            
        ])
        var k4 = this.lagrange_rhs([
            y[0] + dt * k3[0], 
            y[1] + dt * k3[1], 
            y[2] + dt * k3[2], 
            y[3] + dt * k3[3],
            y[4] + dt * k3[4],
            y[5] + dt * k3[5]
        ])
        var R = [
            1/6 * dt * (k1[0] + 2*k2[0] + 2*k3[0] + k4[0]),
            1/6 * dt * (k1[1] + 2*k2[1] + 2*k3[1] + k4[1]),
            1/6 * dt * (k1[2] + 2*k2[2] + 2*k3[2] + k4[2]),
            1/6 * dt * (k1[3] + 2*k2[3] + 2*k3[3] + k4[3]),
            1/6 * dt * (k1[4] + 2*k2[4] + 2*k3[4] + k4[4]),
            1/6 * dt * (k1[5] + 2*k2[5] + 2*k3[5] + k4[5]),
        ]

        this.theta1 += R[0]
        this.theta2 += R[1]
        this.theta3 += R[2]
        this.theta1dot += R[3] 
        this.theta2dot += R[4] 
        this.theta3dot += R[5] 

    }

    getCoords() {
        return {
            'x1':Math.sin(this.theta1),
    		'y1':Math.cos(this.theta1),
	    	'x2':Math.sin(this.theta1) + Math.sin(this.theta2),
		    'y2':Math.cos(this.theta1) + Math.cos(this.theta2),
	    	'x3':Math.sin(this.theta1) + Math.sin(this.theta2) + Math.sin(this.theta3),
		    'y3':Math.cos(this.theta1) + Math.cos(this.theta2) + Math.cos(this.theta3)
        }
    }
}

export class TriplePendulumPlayer {
    constructor(el) {
        this._pause = false;
        this.nPendulums = 10;
        this.pendulums = d3.range(this.nPendulums).map(x => new TriplePendulum({theta1: 0.75 * Math.PI + 0.00001*x/this.nPendulums}))


        this.width = 300;
        this.height = 300;

        d3.select(el).select('.exhibit-media-container')
            .style('background-color', 'white')

        d3.select(el).select('a')
            .on('mouseenter', () => { this._pause = false; this.play(); })
            .on('scrollenter', () => { this._pause = false; this.play(); })
            .on('mouseout', () => { this.pause() })
            .on('scrollout', () => { this.pause() })

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

        this.scale = d3.scaleLinear().domain([0,1.5]).range([0,100])

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

        this.pendulums.forEach(p => p.time_step(0.005));

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
            this.context.moveTo(this.scale(oldCoords[i].x3) + this.width/2, this.scale(oldCoords[i].y3) + this.height/2);
            this.context.lineTo(this.scale(coords[i].x3) + this.width/2, this.scale(coords[i].y3) + this.height/2);
            this.context.stroke();
        }

        var pendulum = this.g.selectAll(".pendulum").data(coords, function(d, i) { return i; })

        var pendulumEnter = pendulum.enter()
            .append("g").attr("class","pendulum")

        pendulumEnter.append("line").attr("class", "firstShaft shaft")
        pendulumEnter.append("line").attr("class", "secondShaft shaft")
        pendulumEnter.append("line").attr("class", "thirdShaft shaft")
        pendulumEnter.append("circle").attr("class", "firstBob bob").attr("r",3)
        pendulumEnter.append("circle").attr("class", "secondBob bob").attr("r",3)
        pendulumEnter.append("circle").attr("class", "thirdBob bob").attr("r",7)

	var shaft1 = pendulum.select(".firstShaft")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", d => this.scale(d.x1))
		.attr("y2", d => this.scale(d.y1))
		.attr('stroke', (d, i) => this.color(i))

	var shaft2 = pendulum.select(".secondShaft")
		.attr("x1", d => this.scale(d.x1))
		.attr("y1", d => this.scale(d.y1))
		.attr("x2", d => this.scale(d.x2))
		.attr("y2", d => this.scale(d.y2))
		.attr('stroke', (d, i) => this.color(i))

	var shaft3 = pendulum.select(".thirdShaft")
		.attr("x1", d => this.scale(d.x2))
		.attr("y1", d => this.scale(d.y2))
		.attr("x2", d => this.scale(d.x3))
		.attr("y2", d => this.scale(d.y3))
		.attr('stroke', (d, i) => this.color(i))

	var bob1 = pendulum.select(".firstBob")
		.attr("cx", d => this.scale(d.x1))
		.attr("cy", d => this.scale(d.y1))
		.attr('fill', (d, i) => this.color(i))
		.attr('opacity', 1)

	var bob2 = pendulum.select(".secondBob")
		.attr("cx", d => this.scale(d.x2))
		.attr("cy", d => this.scale(d.y2))
		.attr('fill', (d, i) => this.color(i))
		.attr('opacity', 1)

	var bob2 = pendulum.select(".thirdBob")
		.attr("cx", d => this.scale(d.x3))
		.attr("cy", d => this.scale(d.y3))
		.attr('fill', (d, i) => this.color(i))
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
        if (!this.fired) {
            this.fired = true;
            setTimeout(() => {  this.fired = false }, 2);

            if (!this._pause) {
                this.update();
                setTimeout(() => { this.play(); }, 2);
            }
        }
    }

    pause() {
        this._pause = true;
    }
}