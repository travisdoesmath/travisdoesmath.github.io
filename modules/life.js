class Board {

    constructor(x = 30, y = 30, width = 10) {
        this.pixelsX = x;
        this.pixelsY = y;
        this.pixelWidth = width;
    }

    coordToIndex([x, y]) { return this.pixelsX * y + x; }
    indexToCoord(i) { return [i % this.pixelsX, Math.floor(i/this.pixelsX)]; }
}

class Cells {

    constructor(board = new Board(), p = 0.4) {
        this.board = board;
        this.live = []
        d3.range(board.pixelsX).forEach(x => d3.range(board.pixelsY).forEach(y => Math.random() < p ? this.live.push([x,y]): null))
    }

    async evolve() {
        let neighbors = {};
        let addToNeighbors = ([x, y]) => {
            [-1, 0, 1].forEach(dx => [1, 0, -1].forEach(dy => {

                if (dx === 0 && dy === 0) {
                    if (neighbors[`${x+dx},${y+dy}`] === undefined) { // if there is already an entry, change "alive" to true
                        neighbors[`${x+dx},${y+dy}`] = {'alive': true, count:0, x:x+dx, y:y+dy};
                    }
                    else { // otherwise create entry with no neighbors, but alive is true
                        neighbors[`${x+dx},${y+dy}`].alive = true;
                    }
                } else { // neighbor
                    if (neighbors[`${x+dx},${y+dy}`]) { // if another cell has already made a neighbor for this, add one to the count
                        neighbors[`${x+dx},${y+dy}`].count += 1
                    } else { // otherwise, create a new cell with count 1 and coordinates
                        neighbors[`${x+dx},${y+dy}`] = {'alive': false, 'count': 1, x:x+dx, y:y+dy}
                    }
                }
            }));
        }
        
        this.live.forEach(c => addToNeighbors(c))
        let test = Object.keys(neighbors).map(k => neighbors[k])
            .filter(c => c.x >= 0 && c.x < this.board.pixelsX && c.y >= 0 && c.y < this.board.pixelsY)
            .filter(c => c.count == 3 || (c.count == 2 && c.alive))
        this.live = test.map(c => [c.x, c.y]);
        return neighbors;
    }

}

export class LifeGame {

    constructor(el, board = new Board()) {
        this.board = board;
        this.cells = new Cells();
        this._pause = false;

        d3.select(el).select('.exhibit-media-container')
            .style('background-color', 'white')

        d3.select(el).select('a') 
            .on('mouseenter', () => { this._pause = false; this.play(); })
            .on('scrollenter', () => { this._pause = false; this.play(); })
            .on('mouseout', () => { this.pause() })
            .on('scrollout', () => { this.pause() })

        this.svg = d3.select(el).select(".d3-target").append('svg')
            .attr("width", board.pixelWidth * board.pixelsX)
            .attr("height", board.pixelWidth * board.pixelsY)

        this.bg = this.svg.append("g")
        this.fg = this.svg.append("g")

        // draw background squares
        d3.range(board.pixelsX).forEach(x => d3.range(board.pixelsY).forEach(y => {
            this.bg.append("rect")
                .attr("x", board.pixelWidth*x + 1)
                .attr("y", board.pixelWidth*y + 1)
                .attr("width", board.pixelWidth - 2)
                .attr("height", board.pixelWidth - 2)
                .attr("class", "pixel")
            })
        )

        this.draw();
    }

    draw() {
        // draw live cells
        let liveCells = this.fg.selectAll(".cell").data(this.cells.live, d => `$d[0],$d[1]`)
        
        liveCells.enter().append("rect")
        .attr("class","cell")
        .attr("x", d => this.board.pixelWidth*d[0] + 1)
        .attr("y", d => this.board.pixelWidth*d[1] + 1)
            .attr("width", this.board.pixelWidth - 2)
            .attr("height", this.board.pixelWidth - 2)
        //.merge(this.fg)

        liveCells.exit()
        .remove()
    }

    play() {
        if (!this._pause) {
            
            this.cells.evolve().then(this.draw());
            if (!this._pause) { setTimeout(() => { this.play() }, 100); }
        }
    }

    pause() {
        this._pause = true;
    }

}