import { Exhibit } from '../modules/d3exhibit.js'

export class Julia extends Exhibit {
    
    constructor(el) {
        super(el, {bgcolor:'black', width:300, height:300, frameTime: 15});

        this.width = 300;
        this.height = 300;

        this.timestamp = 0;
        this.iterDepth = 20;

        this.scale = d3.scaleLinear().domain([0,1]).range([0,100])

        this.canvas = d3.select(el).select(".d3-target").append('canvas')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('position','absolute')
            .style('top', 0)
            .style('left', 0)

        this.context = this.canvas.node().getContext('2d');
        this.imageData = this.context.createImageData(this.width, this.height);

        this.svg = d3.select(el).select(".d3-target").append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('position','absolute')
            .style('top', 0)
            .style('left', 0)

        this.g = this.svg.append("g").attr("transform", "translate(" + this.width*.5 + "," + this.height*.5 + ")");

        this.setScales()

        this.update().then(this.draw());

    }

    async update() {
        this.timestamp += 60;
        this.draw();
        return this.timestamp;
    }

    setScales() {
        this.xScale = d3.scaleLinear().domain([-2, 2]).range([0, this.width])
        this.yScale = d3.scaleLinear().domain([-2, 2]).range([this.height, 0])

    }

    draw() {
        function jIter(z, c) {
    	    return cAdd(cSquare(z[0], z[1]), c)
        }

        function magSq(z) {
            return z[0] * z[0] + z[1] * z[1];
        }

        function cAdd(z1, z2) {
            return [z1[0] + z2[0], z1[1] + z2[1]]
        }

        function cSquare(real, imag) {
            return [real * real - imag * imag, 2*real*imag]
        }


        let theta1 = 0;
        let theta2 = 1;

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                let jReal = -0.5 + 1.25 * Math.sin(theta1 + this.timestamp/1000);
			    let jImag = 1.25 * Math.cos(theta2 + this.timestamp/710);

                var real = this.xScale.invert(x);
                var imag = this.yScale.invert(y);
                let c = [jReal, jImag];
                let jz = [real, imag];
                let count = 0;
                let i = 4 * (y * this.width + x)
                while (count < this.iterDepth && magSq(jz) < 4) {
                    count++;
                    jz = jIter(jz, c);
                }
                count == this.iterDepth ? this.imageData.data[i] = 0 : this.imageData.data[i] = (255 / Math.log(this.iterDepth))*Math.log(count);
                this.imageData.data[i + 3] = 255;
            }
        }
        this.context.putImageData(this.imageData, 0, 0);

    }

}
