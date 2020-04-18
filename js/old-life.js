var d3life = (function() {
    const pixelWidth = 10,
        pixelsX = 30,
        pixelsY = 30;

    const margin = {top: 10, right: 0, bottom: 10, left: 35}

    let timeStep = 64,
        minTimeStep = 8,
        maxTimeStep = 512;

    let cells = [],
        cellCounts = [],
        nIterations = 0;

    function initializeCells(p) {
        nIterations = 0;
        cells = [];
        for (let x = 0; x < pixelsX; x++) {
            let row = [];
            for (let y = 0; y < pixelsY; y++) {
                row.push(Math.random() < p);
            }
            cells.push(row)
        }    
    }

    function getNumberOfLiveCells(x, y) {
        let n = 0;
        if (isAlive(x-1,y-1)) {n++}
        if (isAlive(x,y-1)) {n++}
        if (isAlive(x+1,y-1)) {n++}

        if (isAlive(x-1,y)) {n++}
        if (isAlive(x+1,y)) {n++}

        if (isAlive(x-1,y+1)) {n++}
        if (isAlive(x,y+1)) {n++}
        if (isAlive(x+1,y+1)) {n++}
        return n;
    }

    function isAlive(x, y) {
        try {
            if (x < 0) x = pixelsX + x;
            if (y < 0) y = pixelsY + y;
            x = x % pixelsX;
            y = y % pixelsY;
            value = cells[x][y];    
        }
        catch(error) {
            console.log(`x: ${x}, y: ${y}`)
        }
        return cells[x][y];
    }

    function evolve(cells) {
        let newCells = [];
        for (let x = 0; x < pixelsX; x++) {
            let row = [];
            for (let y = 0; y < pixelsY; y++) {
                // Conway's life rules
                if (cells[x][y]) {
                    // cell is currently alive
                    n = getNumberOfLiveCells(x, y);
                    if (n == 2 || n == 3) {
                        row.push(true);
                    } else {
                        row.push(false);
                    }
                } else {
                    // cell is currently dead
                    n = getNumberOfLiveCells(x, y);
                    if (n == 3) {
                        row.push(true);
                    } else {
                        row.push(false);
                    }
                }
            }
            newCells.push(row)
        }        
        return newCells;
    }

    function sparseData(matrix) {
        sparseMatrix = matrix.map((d, x) => d.map((dd, y) => { return {x:x, y:y, alive:dd}; }))
        merged = [].concat.apply([], sparseMatrix).filter(d => d.alive);
        return merged;
    }

    coordToIndex = d => pixelsX * d.y + d.x;
    indexToCoord = i => { return {x:i % pixelsX, y:Math.floor(i/pixelsX)}; }

    let lifeSvg = d3.select("#life").select('.d3-target').append('svg')

    lifeSvg
        .attr("width", pixelWidth * pixelsX)
        .attr("height", pixelWidth * pixelsY)

    bg = lifeSvg.append("g")
    fg = lifeSvg.append("g")

    function initializePixels() {
        d3.range(pixelsX).forEach(x => d3.range(pixelsY).forEach(y => 
            bg.append("rect")
                .attr("x", pixelWidth*x + 1)
                .attr("y", pixelWidth*y + 1)
                .attr("width", pixelWidth - 2)
                .attr("height", pixelWidth - 2)
                .attr("class", "pixel")
            )
        )
    }

    function drawScreen(sparseCells) {
        // draw live cells
        let liveCells = fg.selectAll(".cell").data(sparseCells, d => coordToIndex(d))
        
        liveCells.enter().append("rect")
        .attr("class","cell")
        .attr("x", d => pixelWidth*d.x + 1)
        .attr("y", d => pixelWidth*d.y + 1)
            .attr("width", pixelWidth - 2)
            .attr("height", pixelWidth - 2)
        .merge(fg)

        liveCells.exit()
        .remove()

    }

    function play() {
        nIterations++;
        let sparseCells = sparseData(cells);
        cellCounts.push(sparseCells.length);
        if (cellCounts.length > 1000) {
            cellCounts = cellCounts.slice(1);
        }
        drawScreen(sparseCells);
        cells = evolve(cells);
        if (!pause) { setTimeout(play, timeStep); }
        pause = false;
    }

    function pause() {
        pause = true;
    }


    var pause = false;
    initializeCells(0.4);
    initializePixels();

    //play();

    return {
        play
    };

})()

d3life.play();