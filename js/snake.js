const pixelWidth = 20,
    pixelsX = 15,
    pixelsY = 15;

var snake = {
    direction:[1,0],
    length:2,
    coords:[[Math.floor(pixelsX/2),Math.floor(pixelsY/2)],[Math.floor(pixelsX/2)+1,Math.floor(pixelsY/2)]]
}

var alive = true;


coordToIndex = ([x, y]) => pixelsX * y + x;
indexToCoord = i => [i % pixelsX, Math.floor(i/pixelsX)];

function setFood() {
    var emptyPixelIndices = d3.range(pixelsX*pixelsY).filter(d => !snake.coords.map(coordToIndex).includes(d));
    foodLocationIndex = emptyPixelIndices[Math.floor(Math.random()*emptyPixelIndices.length)];
    return indexToCoord(foodLocationIndex)
}

food = setFood();

d3.select("#snake")
    .style('background-color', 'white')

var svg = d3.select("#snake").select(".d3-target").append('svg')

svg
    .attr("width", pixelWidth * pixelsX)
    .attr("height", pixelWidth * pixelsY)

bg = svg.append("g")
fg = svg.append("g")

d3.range(pixelsX).forEach(x => d3.range(pixelsY).forEach(y => 
        bg.append("rect")
            .attr("x", pixelWidth*x + 1)
            .attr("y", pixelWidth*y + 1)
            .attr("width", pixelWidth - 2)
            .attr("height", pixelWidth - 2)
            .attr("class", "pixel")
    )
)

function drawScreen() {
    // draw snake
    fg.selectAll(".snake").data(snake.coords, d => coordToIndex(d))
    .join(enter => enter.append("rect")
        .attr("class","snake")
        .attr("x", d => pixelWidth*d[0] + 1)
        .attr("y", d => pixelWidth*d[1] + 1)
        .attr("width", pixelWidth - 2)
        .attr("height", pixelWidth - 2),
        update => update,
        exit => exit.remove()
    )

    fg.selectAll(".food").data([food], d => coordToIndex(d))
    .join(enter => enter.append("rect")
        .attr("class","food")
        .attr("x", d => pixelWidth*d[0] + 1)
        .attr("y", d => pixelWidth*d[1] + 1)
        .attr("width", pixelWidth - 2)
        .attr("height", pixelWidth - 2),
        update => update,
        exit => exit.remove()
    )
}

function play() {
    if (alive) {

        // calculate snake's next position
        currentPos = snake.coords[snake.coords.length - 1];
        nextPos = [currentPos[0] + snake.direction[0], currentPos[1] + snake.direction[1]];

        

        if ((food[0] < currentPos[0] && snake.direction[0] !== 1)) { snake.direction = [-1, 0]} // if food is left and snake is not going right, or snake is about to hit top border, go left
        if ((food[0] > currentPos[0] && snake.direction[0] !== -1)) { snake.direction = [1, 0]} // if food is right and snake is not going left, go right
        if ((food[1] < currentPos[1] && snake.direction[1] !== 1)) { snake.direction = [0, -1]} // if food is up and snake is not going down, go up
        if ((food[1] > currentPos[1] && snake.direction[1] !== -1)) { snake.direction = [0, 1]} // if food is down and snake is not going up, go 

        if (nextPos[1] < 0 || nextPos[1] > pixelsY - 1) { snake.direction = [Math.sign(food[0] - currentPos[0] ), 0] }
        if (nextPos[0] < 0 || nextPos[0] > pixelsX - 1) { snake.direction = [0, Math.sign(food[1] - currentPos[1])] }

        nextPos = [currentPos[0] + snake.direction[0], currentPos[1] + snake.direction[1]];

        // check if nextPos is outside of game area or hits snake
        if (nextPos[0] < 0 || nextPos[0] > pixelsX - 1 || nextPos[1] < 0 || nextPos[1] > pixelsY - 1 || snake.coords.map(coordToIndex).includes(coordToIndex(nextPos))) { 
            alive = false; 
            endGame();
        } else {
            snake.coords.push(nextPos)

            // check if nextPos is food
            if (coordToIndex(food) === coordToIndex(nextPos)) {
                food = setFood();
            } else {
                snake.coords = snake.coords.slice(1);
            }
            drawScreen();
            if (!pause) { setTimeout(play, 100); }
        }
    }
}

function endGame() {
    fg.selectAll(".snake").data([])
        .exit()
        .transition()
        .duration(1000)
        .attr("width", 0)
        .attr("height", 0)
        .attr("transform", `translate(${pixelWidth/2},${pixelWidth/2})`)
        .call(() => {
            snake = {
                direction:[1,0],
                length:2,
                coords:[[Math.floor(pixelsX/2),Math.floor(pixelsY/2)],[Math.floor(pixelsX/2)+1,Math.floor(pixelsY/2)]]
            }
            food = setFood()
            setTimeout(() => {alive = true; play();}, 1250);
        })
}

pause = true;
play()

d3.select("#snake")
    .on('mouseover', () => { pause = false; play(); })
    .on('mouseout', () => { pause = true; })


