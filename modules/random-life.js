export class RandomLifeGame {

    constructor(el, options = {}) {
        this.pixelsX = 120;
        this.pixelsY = 120;
        this.pixelWidth = 2.5;
        this.nIterations = 0;

        if (options.pixelsX) this.pixelsX = options.pixelsX;
        if (options.pixelsY) this.pixelsY = options.pixelsY;
        if (options.pixelWidth) this.pixelWidth = options.pixelWidth;

        this.cells = [];
        this._pause = false;

        d3.select(el).select('.exhibit-media-container')
            .style('background-color', 'white')

        d3.select(el).select('a') 
            .on('mouseenter', () => { this._pause = false; this.play(); })
            .on('scrollenter', () => { this._pause = false; this.play(); })
            .on('mouseout', () => { this.pause() })
            .on('scrollout', () => { this.pause() })

        this.canvas = d3.select(el).select(".d3-target").append('canvas')
            .attr("width", this.pixelWidth * this.pixelsX)
            .attr("height", this.pixelWidth * this.pixelsY)

        this.initializePattern();
        this.initializeCells();
        this.draw();
    }

    async initializePattern() {
        let neighborRadius = 5;

        this.randomShape = [];

        for (let i = 0; i < 8; i++) {
            let r = 1 + (neighborRadius - 1) * Math.random()
            let theta = Math.random() * Math.PI * 2
            let x = Math.round(r * Math.cos(theta))
            let y = Math.round(r * Math.sin(theta))

            this.randomShape.push({
                x: x,
                y: y
            })
        }
    }

    async initializeCells() {
        let p = 0.19;

        this.cells = [];
        for (let x = 0; x < this.pixelsX; x++) {
            let row = [];
            for (let y = 0; y < this.pixelsY; y++) {
                let cell = {
                    value: Math.random() < p,
                    neighbors: []
                }
                for (let i = 0; i < 8; i++) {
                    cell.neighbors.push({
                        x: x + this.randomShape[i].x, 
                        y: y + this.randomShape[i].y
                    })
                }
                row.push(cell);
            }
            this.cells.push(row)
        }  
    }

    getNumberOfLiveCells(x, y) {
        let cell = this.cells[x][y]
        let n = 0;

        for (let i = 0; i < cell.neighbors.length; i++) {
            let x = cell.neighbors[i].x;
            let y = cell.neighbors[i].y;
            if (this.isAlive(x, y)) n++;
        }

        return n;
    }

    isAlive(x, y) {
        let value = false;
        try {
            if (x < 0) x = this.pixelsX + x;
            if (y < 0) y = this.pixelsY + y;
            x = x % this.pixelsX;
            y = y % this.pixelsY;
            value = this.cells[x][y].value;    
        }
        catch(error) {
            console.log('this.cells', this.cells)
            console.log(`x: ${x}, y: ${y}`)
        }
        return value;
    }

    async evolve() {
        this.nIterations++;
        let newCells = [];
        for (let x = 0; x < this.pixelsX; x++) {
            let row = [];
            for (let y = 0; y < this.pixelsY; y++) {
                // Conway's life rules
                if (this.cells[x][y].value) {
                    // cell is currently alive
                    let n = this.getNumberOfLiveCells(x, y);
                    if (n == 2 || n == 3) {
                        row.push({
                            value: true,
                            neighbors: this.cells[x][y].neighbors
                        });
                    } else {
                        row.push({
                            value: false,
                            neighbors: this.cells[x][y].neighbors
                        });
                    }
                } else {
                    // cell is currently dead
                    let n = this.getNumberOfLiveCells(x, y);
                    if (n == 3) {
                        row.push({
                            value: true,
                            neighbors: this.cells[x][y].neighbors
                        });
                    } else {
                        row.push({
                            value: false,
                            neighbors: this.cells[x][y].neighbors
                        });
                    }
                }
            }
            newCells.push(row)
        }        
        this.cells = newCells;
    }

    draw() {
        let context = this.canvas.node().getContext('2d');
        context.beginPath();
        context.clearRect(0, 0, this.pixelWidth * this.pixelsX, this.pixelWidth * this.pixelsY)

        for (let x = 0; x < this.pixelsX; x++) {
            for (let y = 0; y < this.pixelsY; y++) {
                if (this.cells[x][y].value) {
                    context.beginPath();
                    context.fillRect(this.pixelWidth * x, this.pixelWidth * y, this.pixelWidth, this.pixelWidth)
                }
            }
        }
    }

    play() {
        if (!this.fired) {
            this.fired = true;
            setTimeout(() => {  this.fired = false }, 100);

            if (!this._pause) {


                if (this.nIterations > 20) {
                    this.nIterations = 0;
                    this.initializePattern().then(this.initializeCells().then(this.evolve().then(this.draw())))
                    if (!this._pause) { setTimeout(() => { this.play() }, 100); }
                } else {
                    this.evolve().then(this.draw());
                    if (!this._pause) { setTimeout(() => { this.play() }, 100); }
                }
            }
        }
    }

    pause() {
        this._pause = true;
    }

}