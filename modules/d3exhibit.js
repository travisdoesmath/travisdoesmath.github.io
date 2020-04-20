class Exhibit {
    constructor(el, opts) {
        Object.keys(opts).forEach(k => this[k] = opts[k]);

        d3.select(el).select('.exhibit-media-container')
            .style('background-color', 'white')

        d3.select(el).select('a') 
            .on('mouseenter', () => { this._pause = false; this.play(); })
            .on('mouseout', () => { this.pause() });

        this.svg = d3.select(el).select(".d3-target").append('svg')
            .attr("width", board.pixelWidth * board.pixelsX)
            .attr("height", board.pixelWidth * board.pixelsY)

    } 
    
    play() {
        if (!this._pause) {
            
            this.cells.evolve().then(this.draw());
            this.update().then(this.draw()).then(setTimeout(() => {this.play();}, 100));
            if (!this._pause) { setTimeout(() => { this.play() }, 100); }
        }
    }

    pause() {
        this._pause = true;
    }

}








