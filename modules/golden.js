




	var depth = 7;

	var width = 960,
		height = 500;

	var splitTransformation = function(T, n) {
		var C = function(n, theta, r) {
			return (1-r*Math.cos(theta)-r**(n+1)*Math.cos((n+1)*theta)+r**(n+2)*Math.cos(n*theta))/(1-2*r*Math.cos(theta)+r**2)
		}
		var S = function(n, theta, r) {
			return (r*Math.sin(theta)-r**(n+1)*Math.sin((n+1)*theta)+r**(n+2)*Math.sin((n)*theta))/(1-2*r*Math.cos(theta)+r**2)
		}
		var detM = C(n-1, T.theta/n, T.A**(1/n))**2 + S(n-1, T.theta/n, T.A**(1/n))**2;
		var new_t_x = (T.t_x *  C(n-1, T.theta/n, T.A**(1/n)) + T.t_y * S(n-1, T.theta/n, T.A**(1/n)))/detM;
		var new_t_y = (T.t_x * -S(n-1, T.theta/n, T.A**(1/n)) + T.t_y * C(n-1, T.theta/n, T.A**(1/n)))/detM;
		var T_split = {
			'A':(T.A)**(1/n),
			'theta':T.theta/n,
			't_x':new_t_x,
			't_y':new_t_y
		};
		return T_split;
	}

	var composeTransformations = function(T_1, T_2) {
		return {
			'A': T_1.A * T_2.A,
			'theta': T_1.theta + T_2.theta,
			't_x': T_2.A * T_1.t_x * Math.cos(T_2.theta) - T_2.A * T_1.t_y * Math.sin(T_2.theta) + T_2.t_x,
			't_y': T_2.A * T_1.t_x * Math.sin(T_2.theta) + T_2.A * T_1.t_y * Math.cos(T_2.theta) + T_2.t_y
		}
	}


	var scale = d3.scaleLinear().domain([0,1]).range([0,130])

	var svg = d3.select("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(50,50)");

	var lowerLayer = svg.append("g")
	var upperLayer = svg.append("g")

	var draw = function(angle, n) {

		color = d3.scaleSequential(d3.interpolateRainbow).domain([0, 5*n]);

		T = {
			'A':Math.sqrt(5)/2 - 0.5,
			'theta': angle,
			't_x':1,
			't_y':1
		}

		var T_split = splitTransformation(T, n);

		transformations = [{'A':1, 'theta':0, 't_x': 0, 't_y': 0}];
		for (var i = 0; i < depth*n; i++) {
			var T_next = composeTransformations(transformations[transformations.length - 1], T_split);
			transformations.push(T_next);
		}

		var squares = lowerLayer.selectAll(".square").data(transformations)

		squares
			.enter()
		 	.append("rect")
			.attr("class", "square")
			.attr("width", scale(1))
			.attr("height", scale(1))
			.attr("transform", function(t) { 
				var a = t.A * Math.cos(t.theta),
					b = t.A * Math.sin(t.theta),
					c = - t.A * Math.sin(t.theta),
					d = t.A * Math.cos(t.theta),
					e = scale(t.t_x),
					f = scale(t.t_y);
				return "matrix(" + a + "," + b + "," + c + "," + d + "," + e + "," + f + ")"; })

		squares
			.attr("transform", function(t) { 
				var a = t.A * Math.cos(t.theta),
					b = t.A * Math.sin(t.theta),
					c = - t.A * Math.sin(t.theta),
					d = t.A * Math.cos(t.theta),
					e = scale(t.t_x),
					f = scale(t.t_y);
				return "matrix(" + a + "," + b + "," + c + "," + d + "," + e + "," + f + ")"; })
			.attr("stroke", function(d, i) { return color(i); })
			.attr("stroke-width", function(d, i) { return 2/d.A + "px"; })
			//.attr("fill", function(d, i) { return color(i); })
			.attr("fill", "none")

		squares.exit()
			.remove();

		var goldenTransformations = [{'A':1, 'theta':0, 't_x': 0, 't_y': 0}];
		for (var i = 0; i < depth; i++) {
			var T_next = composeTransformations(goldenTransformations[goldenTransformations.length - 1], T);
			goldenTransformations.push(T_next);
		}

		var goldenSquares = upperLayer.selectAll(".mainSquare").data(goldenTransformations, function(d) { return d.A; });

		goldenSquares
			.enter()
		 	.append("rect")
			.attr("class", "mainSquare")
			.attr("width", scale(1))
			.attr("height", scale(1))
			.attr("stroke", "white")
			.attr("stroke-width", function(d, i) { return 2/d.A + "px"; })
			.attr("transform", function(t) { 
				var a = t.A * Math.cos(t.theta),
					b = t.A * Math.sin(t.theta),
					c = - t.A * Math.sin(t.theta),
					d = t.A * Math.cos(t.theta),
					e = scale(t.t_x),
					f = scale(t.t_y);
				return "matrix(" + a + "," + b + "," + c + "," + d + "," + e + "," + f + ")"; })

		goldenSquares
			.attr("transform", function(t) { 
				var a = t.A * Math.cos(t.theta),
					b = t.A * Math.sin(t.theta),
					c = - t.A * Math.sin(t.theta),
					d = t.A * Math.cos(t.theta),
					e = scale(t.t_x),
					f = scale(t.t_y);
				return "matrix(" + a + "," + b + "," + c + "," + d + "," + e + "," + f + ")"; })

	}

	step = 0;
	n = 1;
	var animate = function() {
		step = (step + 1/100) % 2;
		n = d3.easeQuadIn(d3.easeQuadInOut(Math.min(step, 2 - step))) * 8 + 1;
		draw(-Math.PI / 2 + d3.easeQuadInOut(Math.min(step, 2 - step)) * Math.PI, n);
	}

	anim = d3.timer(animate);