Array.prototype.scalarMultiply = function(x) { return this.map(function(d) { return x * d; }); }

var l1 = 1, l2 = 1,
	m1 = 1, m2 = 1,
	G = 9.8;

var theta1 = 0.49*Math.PI,
	theta2 = 1.0*Math.PI,
	p1 = 0,
	p2 = 0;

var nPendula = 40,
	initialRange = 1e-4;

theta1dot = function(theta1, theta2, p1, p2) {
	return (p1*l2 - p2*l1*Math.cos(theta1 - theta2))/(l1**2*l2*(m1 + m2*Math.sin(theta1 - theta2)**2));
}

theta2dot = function(theta1, theta2, p1, p2) {
	return (p2*(m1+m2)*l1 - p1*m2*l2*Math.cos(theta1 - theta2))/(m2*l1*l2**2*(m1 + m2*Math.sin(theta1 - theta2)**2));
}

p1dot = function(theta1, theta2, p1, p2) {
	var A1 = (p1*p2*Math.sin(theta1 - theta2))/(l1*l2*(m1 + m2*Math.sin(theta1 - theta2)**2)),
		A2 = (p1**2*m2*l2**2 - 2*p1*p2*m2*l1*l2*Math.cos(theta1 - theta2) + p2**2*(m1 + m2)*l1**2)*Math.sin(2*(theta1 - theta2))/(2*l1**2*l2**2*(m1 + m2*Math.sin(theta1 - theta2)**2)**2);
	return -(m1 + m2)*G*l1*Math.sin(theta1) - A1 + A2;
}

p2dot = function(theta1, theta2, p1, p2) {
	var A1 = (p1*p2*Math.sin(theta1 - theta2))/(l1*l2*(m1 + m2*Math.sin(theta1 - theta2)**2)),
		A2 = (p1**2*m2*l2**2 - 2*p1*p2*m2*l1*l2*Math.cos(theta1 - theta2) + p2**2*(m1 + m2)*l1**2)*Math.sin(2*(theta1 - theta2))/(2*l1**2*l2**2*(m1 + m2*Math.sin(theta1 - theta2)**2)**2);
	return -m2*G*l2*Math.sin(theta2) + A1 - A2;

}

var Z = [theta1, theta2, p1, p2],
	oldZ = Z;

deltas = d3.range(-initialRange/2, initialRange/2,initialRange/nPendula);

Zs = deltas.map(x=>[Z[0],Z[1]+x,Z[2],Z[3]])

f = function(Z) {
	return [theta1dot(Z[0], Z[1], Z[2], Z[3]), theta2dot(Z[0], Z[1], Z[2], Z[3]), p1dot(Z[0], Z[1], Z[2], Z[3]), p2dot(Z[0], Z[1], Z[2], Z[3])];
}

RK4 = function(Z_n, f, tau) {
	var Y1 = f(Z_n).scalarMultiply(tau);
	var Y2 = f([Z_n[0] + 0.5*Y1[0], Z_n[1] + 0.5*Y1[1], Z_n[2] + 0.5*Y1[2], Z_n[3] + 0.5*Y1[3]]).scalarMultiply(tau);
	var Y3 = f([Z_n[0] + 0.5*Y2[0], Z_n[1] + 0.5*Y2[1], Z_n[2] + 0.5*Y2[2], Z_n[3] + 0.5*Y2[3]]).scalarMultiply(tau);
	var Y4 = f([Z_n[0] + Y3[0], Z_n[1] + Y3[1], Z_n[2] + Y3[2], Z_n[3] + Y3[3]]).scalarMultiply(tau);

	return [
		Z_n[0] + Y1[0]/6 + Y2[0]/3 + Y3[0]/3 + Y4[0]/6,
		Z_n[1] + Y1[1]/6 + Y2[1]/3 + Y3[1]/3 + Y4[1]/6,
		Z_n[2] + Y1[2]/6 + Y2[2]/3 + Y3[2]/3 + Y4[2]/6,
		Z_n[3] + Y1[3]/6 + Y2[3]/3 + Y3[3]/3 + Y4[3]/6,
	]
}

getCoords = function(Z) {
	return	{
		'x1':l1*Math.sin(Z[0]),
		'y1':l1*Math.cos(Z[0]),
		'x2':l1*Math.sin(Z[0]) + l2*Math.sin(Z[1]),
		'y2':l1*Math.cos(Z[0]) + l2*Math.cos(Z[1])
	};
}