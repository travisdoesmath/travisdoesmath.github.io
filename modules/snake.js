class Board {

    constructor(x = 15, y = 15, width = 20) {
        this.pixelsX = x;
        this.pixelsY = y;
        this.pixelWidth = width;

    }

    coordToIndex = ([x, y]) => this.pixelsX * y + x;
    indexToCoord = i => [i % this.pixelsX, Math.floor(i/this.pixelsX)];
}

class Snake {
    constructor(board) {
        this.direction = 'right';
        this.length = 2;

        this.board = board;

        let pixelsX = board.pixelsX;
        let pixelsY = board.pixelsY;
        this.coords = [[Math.floor(pixelsX/2),Math.floor(pixelsY/2)],[Math.floor(pixelsX/2)+1,Math.floor(pixelsY/2)]]        
    }

    currentPos() {
        return this.coords[this.coords.length - 1];
    }

    nextPos() {
        let currentPos = this.currentPos();
        if (this.direction === 'right') { return [currentPos[0] + 1, currentPos[1]]; }
        if (this.direction === 'left') { return [currentPos[0] - 1, currentPos[1]]; }
        if (this.direction === 'up') { return [currentPos[0], currentPos[1] - 1]; }
        if (this.direction === 'down') { return [currentPos[0], currentPos[1] + 1]; }
    }

    turn(leftright) {
        if (leftright === 'left') {
            if (this.direction == 'right') { this.direction = 'up'; return 'up'; }
            if (this.direction == 'left') { this.direction = 'down'; return 'down'; }
            if (this.direction == 'up') { this.direction = 'left'; return 'left'; }
            if (this.direction == 'down') { this.direction = 'right'; return 'right'; }
        } else if (leftright == 'right') {
            if (this.direction == 'right') { this.direction = 'down'; return 'down'; }
            if (this.direction == 'left') { this.direction = 'up'; return 'up'; }
            if (this.direction == 'up') { this.direction = 'right'; return 'right'; }
            if (this.direction == 'down') { this.direction = 'left'; return 'left'; }
        }
    }
}

class GameState {

    constructor(board, snake) {
        this.board = board;
        this.snake = snake;

        this.food = this.setFood();
        this.alive = true;
        this.pause = false;
    }

    setFood() {
        let emptyPixelIndices = d3.range(this.board.pixelsX*this.board.pixelsY).filter(d => !this.snake.coords.map(this.board.coordToIndex).includes(d));
        let foodLocationIndex = emptyPixelIndices[Math.floor(Math.random()*emptyPixelIndices.length)];
        return this.board.indexToCoord(foodLocationIndex)
    }

}

export class SnakeGame {

    constructor(el, board = new Board(), snake = new Snake(board)) {
        this.board = board;
        this.state = new GameState(board, snake);

        d3.select(el)
            .style('background-color', 'white')
            .on('mouseenter', () => { this.state.pause = false; this.play(); })
            .on('mouseout', () => { this.pause(); })

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
        this.render()
    }

    pause() {
        this.state.pause = true;
    }

    play() {
        if (this.state.alive) {

            let snake = this.state.snake;

            let currentPos = this.state.snake.currentPos();

            if (this.state.food[1] > currentPos[1]) {
                if (snake.direction == 'right' || snake.direction == 'up') snake.turn('right')
                if (snake.direction == 'left') snake.turn('left')
            } else if (this.state.food[1] < currentPos[1]) {
                if (snake.direction == 'right' || snake.direction == 'down') snake.turn('left')
                if (snake.direction == 'left') snake.turn('right')
            } else {
                if (this.state.food[0] > currentPos[0]) {
                    if (snake.direction == 'up' || snake.direction == 'left') snake.turn('right')
                    if (snake.direction == 'down') snake.turn('left')
                } else if (this.state.food[0] < currentPos[0]) {
                    if (snake.direction == 'up' || snake.direction == 'right') snake.turn('left')
                    if (snake.direction == 'down') snake.turn('right')
                }
            }

            let nextPos = snake.nextPos();

            // check if nextPos is outside of game area or hits snake
            if (nextPos[0] < 0 || 
                nextPos[0] > this.board.pixelsX - 1 || 
                nextPos[1] < 0 || 
                nextPos[1] > this.board.pixelsY - 1 || 
                snake.coords.map(this.board.coordToIndex).includes(this.board.coordToIndex(nextPos))) { 
                this.alive = false; 
                this.endGame();
            } else {
                snake.coords.push(nextPos)

                // check if nextPos is food
                if (this.board.coordToIndex(this.state.food) === this.board.coordToIndex(nextPos)) {
                    this.state.food = this.state.setFood();
                } else {
                    snake.coords = snake.coords.slice(1);
                }
                this.render();
                if (!this.state.pause) { setTimeout(() => { this.play() }, 100); }
            }
        }

    }

    endGame() {
        this.fg.selectAll(".snake").data([])
            .exit()
            .transition()
            .duration(1000)
            .attr("width", 0)
            .attr("height", 0)
            .attr("transform", `translate(${this.board.pixelWidth/2},${this.board.pixelWidth/2})`)
            .call(() => {
                this.state.snake = new Snake(this.board)
                this.state.food = this.state.setFood()
                setTimeout(() => {this.state.alive = true; this.play();}, 1250);
            })
    }

    render() {
        // draw snake
        this.fg.selectAll(".snake").data(this.state.snake.coords, d => this.board.coordToIndex(d))
        .join(enter => enter.append("rect")
            .attr("class","snake")
            .attr("x", d => this.board.pixelWidth*d[0] + 1)
            .attr("y", d => this.board.pixelWidth*d[1] + 1)
            .attr("width", this.board.pixelWidth - 2)
            .attr("height", this.board.pixelWidth - 2),
            update => update,
            exit => exit.remove()
        )

        // draw food
        this.fg.selectAll(".food").data([this.state.food], d => this.board.coordToIndex(d))
        .join(enter => enter.append("rect")
            .attr("class","food")
            .attr("x", d => this.board.pixelWidth*d[0] + 1)
            .attr("y", d => this.board.pixelWidth*d[1] + 1)
            .attr("width", this.board.pixelWidth - 2)
            .attr("height", this.board.pixelWidth - 2),
            update => update,
            exit => exit.remove()
        )
    }
}

