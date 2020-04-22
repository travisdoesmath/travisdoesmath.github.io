export class Exhibit {
    constructor(el, opts) {
        
        this.bgcolor = 'white'
        this.frameTime = 100;
        opts ? Object.keys(opts).forEach(k => this[k] = opts[k]) : null;

        d3.select(el).select('.exhibit-media-container')
            .style('background-color', this.bgcolor)

        d3.select(el).select('a') 
            .on('mouseenter', () => { this._pause = false; this.play(); })
            .on('scrollenter', () => { this._pause = false; this.play(); })
            .on('mouseout', () => { this.pause() })
            .on('scrollout', () => { this.pause() })

        this.svg = d3.select(el).select(".d3-target").append('svg')
            .attr("width", this.width)
            .attr("height", this.height)
        
    } 
    
    play() {
        if (!this._pause) {
            this.update().then(this.draw()).then(setTimeout(() => {this.play();}, this.frameTime));
        }
    }

    pause() {
        this._pause = true;
    }

}