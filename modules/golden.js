import { Exhibit } from '../modules/d3exhibit.js'

function generateTransformations(T, n) {
    let T_n = {scale:1, angle:0, t_x:0, t_y:0};
    let matrices = [T_n];
    for (let i = 0; i < n; i++) {
        T_n = composeTransformations(T_n, T)
        matrices.push(T_n);
    }
    return matrices
}

function composeTransformations(T_1, T_2) {
    return {
        'scale': T_1.scale * T_2.scale,
        'angle': T_1.angle + T_2.angle,
        't_x': T_2.scale * T_1.t_x * Math.cos(T_2.angle) - T_2.scale * T_1.t_y * Math.sin(T_2.angle) + T_2.t_x,
		't_y': T_2.scale * T_1.t_x * Math.sin(T_2.angle) + T_2.scale * T_1.t_y * Math.cos(T_2.angle) + T_2.t_y
    }
}

function nthRoot(T, n) {
    let C = function(n, theta, r) {
        return (1-r*Math.cos(theta)-r**(n+1)*Math.cos((n+1)*theta)+r**(n+2)*Math.cos(n*theta))/(1-2*r*Math.cos(theta)+r**2)
    }
    let S = function(n, theta, r) {
        return (r*Math.sin(theta)-r**(n+1)*Math.sin((n+1)*theta)+r**(n+2)*Math.sin((n)*theta))/(1-2*r*Math.cos(theta)+r**2)
    }
    let detM = C(n-1, T.angle/n, T.scale**(1/n))**2 + S(n-1, T.angle/n, T.scale**(1/n))**2;
    let new_t_x = (T.t_x *  C(n-1, T.angle/n, T.scale**(1/n)) + T.t_y * S(n-1, T.angle/n, T.scale**(1/n)))/detM;
	let new_t_y = (T.t_x * -S(n-1, T.angle/n, T.scale**(1/n)) + T.t_y * C(n-1, T.angle/n, T.scale**(1/n)))/detM;

    return {
        'scale':(T.scale)**(1/n),
        'angle':T.angle/n,
        't_x':new_t_x,
        't_y':new_t_y
    };
}

function getMatrixTransformation(T) {
    let a = T.scale * Math.cos(T.angle),
        b = T.scale * Math.sin(T.angle),
        c = -T.scale * Math.sin(T.angle),
        d = T.scale * Math.cos(T.angle),
        e = T.t_x,
        f = T.t_y;

    return `matrix(${a},${b},${c},${d},${e},${f})`;
}

export class GoldenCurl extends Exhibit {

    constructor(el) {
        super(el, {bgcolor:'black', width:300, height:300, frameTime: 15});

        this.depth = 7;
        this.step = 130;

        this.width = 300;
        this.height = 300;

        this.scale = d3.scaleLinear().domain([0,1]).range([0,100])

        this.lowerLayer = this.svg.append("g").attr('transform', 'translate(30,30)')
	    this.upperLayer = this.svg.append("g").attr('transform', 'translate(30,30)')

        this.update().then(this.draw());

    }

    async update() {
        this.step += 1;
        this.step %= 200;
        return this.step;
    }

    draw() {
        let n = d3.easeQuadIn(d3.easeQuadInOut(Math.min(this.step/100, 2 - this.step/100))) * 8 + 1; // number of interpolated squares
        let angle = -Math.PI / 2 + d3.easeQuadInOut(Math.min(this.step/100, 2 - this.step/100)) * Math.PI;
        let T = {scale:Math.sqrt(5)*0.5-0.5, angle:angle, t_x: this.scale(1), t_y: this.scale(1)}
        let mainSquareTransformations = generateTransformations(T, this.depth);
        let interpolatedSquareTransformations = generateTransformations(nthRoot(T, n), this.depth * n);

        let color = d3.scaleSequential(d3.interpolateRainbow).domain([0, 5*n]);

        let mainSquares = this.upperLayer.selectAll(".mainSquare").data(mainSquareTransformations);

        mainSquares
        	.enter()
		 	.append("rect")
			.attr("class", "mainSquare")
			.attr("width", this.scale(1))
			.attr("height", this.scale(1))
			.attr("stroke", "white")
			.attr("stroke-width", d => `${2/d.scale}px`)
			.attr("transform", getMatrixTransformation)
			.attr("fill", "none")
            .merge(mainSquares)
            .attr("transform", getMatrixTransformation)


        let interpolatedSquares = this.lowerLayer.selectAll(".square").data(interpolatedSquareTransformations);

		interpolatedSquares
			.enter()
		 	.append("rect")
			.attr("class", "square")
			.attr("width", this.scale(1))
			.attr("height", this.scale(1))
            .merge(interpolatedSquares)
			.attr("transform", getMatrixTransformation)
			.attr("fill", function(d, i) { return color(i); })
            .attr('fill-opacity', 0.25)
			.attr("stroke", function(d, i) { return color(i); })
			.attr("stroke-width", d => `${2/d.scale}px`)


        interpolatedSquares.exit()
            .remove();

    }
}