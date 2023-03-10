class Canvas {
    static WIDTH = 800;
    static HEIGHT = 700;

    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.canvas.width = Canvas.WIDTH;
        this.canvas.height = Canvas.HEIGHT;
    }
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    drawLine(vectorFrom, vectorTo, r = 0, g = 0, b = 0, a = 1) {
        const { x: x1, y: y1 } = vectorFrom;
        const { x: x2, y: y2 } = vectorTo;

        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }
    drawPoint(vector, r = 4) {
        const { x, y } = vector;
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    drawCircle(vector, r) {
        const { x, y } = vector;
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, 2 * Math.PI);
        this.ctx.stroke();
    }
    drawText(x, y, text) {
        this.ctx.font = "24px serif";
        this.ctx.fillText(text, x + 30, y + 20);
    }
    drawRect(x, y, width, height, fillColor={}) {       
        this.ctx.beginPath();

        this.ctx.fillStyle = `rgb(${fillColor.r}, ${fillColor.g}, ${fillColor.b})`;

        this.ctx.fillRect(x, y, width, height);
        this.ctx.closePath();
    }

    strokeRect(x, y, width, height, color, thickness = 1) {
        this.ctx.beginPath();

        this.ctx.lineWidth = thickness;
        this.ctx.strokeStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;

        this.ctx.strokeRect(x, y, width, height);

        this.ctx.closePath();
    }

}

class FieldCreator {
    static clearField(field) {
        return field.map(row => row.map(() => 0));
    }

    static EMPTY_CELL_WEIGHT = 1;

    constructor(width, height, startPosition, endPosition, fieldWalker) {
        this.width = width;
        this.height = height;
        this.startPosition = startPosition || this.getRadomPosition();
        this.endPosition = endPosition || this.getRadomPosition();
        this.field = this.createFieldAndFill();


        this.fieldWalker = null;
        this.fieldDrawer = null;

        this.isFinished = true;
        this.mazePossitions = [];
    }

    maze(fieldWalker, fieldDrawer, animate = false) {
        this.fieldDrawer = fieldDrawer;
        this.fieldWalker = fieldWalker;
        this.fillField(Infinity);

        this.mazePossitions = [
            fieldCreator.startPosition,
        ];
        this.isFinished = false;
        this.color = FieldDrawer.randomColorRgb();

        if (animate) {
            let loopInterval = null;

            loopInterval = setInterval(() => {
                this.mazeLoop();
                this.displayMazeChanges();
                
                if (this.isFinished) {
                    clearInterval(loopInterval);
                    return;
                }
            });

            return;
        }
    
        while (!this.isFinished) { this.mazeLoop(); }

        this.displayMazeChanges();
    }

    mazeLoop = () => {
        if (!this.mazePossitions.length) {
            this.isFinished = true;
            return;
        };

        const directions = this.fieldWalker.getAviableDirections(
            this.mazePossitions.at(-1)
        )
        
        this.fieldWalker.visit(this.mazePossitions.at(-1));

        if (directions.length === 0) {
            this.mazePossitions.pop();
            this.color = FieldDrawer.randomColorRgb();

            return;
        }

        const newIndex = Math.floor(Math.random() * directions.length);

        const newPossition = directions[newIndex].direction;

        const rest = directions.filter((_, i) => i !== newIndex).map(node => node.direction);

        rest[0] && this.fieldWalker.visit(rest[0]);

        newPossition.color = this.color;

        this.mazePossitions.push(newPossition);

        fieldCreator.field[newPossition[1]][newPossition[0]] = FieldCreator.EMPTY_CELL_WEIGHT;
    }

    displayMazeChanges() {
        this.fieldDrawer.clearField();
        this.fieldDrawer.setVisited(this.fieldWalker.getVisitedPossitions());
        this.fieldDrawer.setObstaclePositions(this.getObstaclesPositions());
        this.fieldDrawer.setMazeBackPath(this.mazePossitions).draw();
    }
    

    getObstaclesPositions() {
        const obstaclePositions = [];

        this.field.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell !== FieldCreator.EMPTY_CELL_WEIGHT) {
                    obstaclePositions.push([x, y]);
                }
            });
        });
    
        return obstaclePositions;
    }

    createFieldAndFill(fill = FieldCreator.EMPTY_CELL_WEIGHT) {
        return Array.from({ length: this.height }, () => Array.from({ length: this.width }, () => fill));
    }

    fillField(fill = FieldCreator.EMPTY_CELL_WEIGHT) {
        this.field = this.createFieldAndFill(fill);

        this.field[this.startPosition[1]][this.startPosition[0]] = FieldCreator.EMPTY_CELL_WEIGHT;
        this.field[this.endPosition[1]][this.endPosition[0]] = FieldCreator.EMPTY_CELL_WEIGHT;
    }

    setRandomObstacles(count = 200, weight = Infinity) {
        for (let i = 0; i < count; i++) {
            const position = this.getRadomPosition();
            const isOnStartPosition = this.isOnStartPosition(position);
            const isOnEndPosition = this.isOnEndPosition(position);

            if (!isOnStartPosition && !isOnEndPosition) {
                this.field[position[1]][position[0]] = weight;
            }
        }
    }

    getRadomPosition() {
        return [Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height)];
    }

    isOnEndPosition([x, y]) {
        return x === this.endPosition[0] && y === this.endPosition[1];
    }

    isOnStartPosition([x, y]) {
        return x === this.startPosition[0] && y === this.startPosition[1];
    }

    isOnObstaclePosition([x, y]) {
        return this.field[y][x] !== FieldCreator.EMPTY_CELL_WEIGHT;
    }
}

class FieldWalker {
    constructor(field, {
        skipInfinityNeighbors = false,
        disableDiagonals = false,
        disableCross = false,
    } = {}) {
        this.field = field;
        this.visited = new Int8Array(field.length * field[0].length);
        this.skipInfinityNeighbors = skipInfinityNeighbors;
        this.disableDiagonals = disableDiagonals;
        this.disableCross = disableCross;
    }

    init() {
        this.visited.fill(0);
    }

    getVisitedPossitions = () => {
        const possitions = [];
    
        for (let i = 0; i < this.visited.length; i++) {
           if (this.visited[i] !== 0) {
                const x = i % this.field[0].length;
                const y = Math.floor(i / this.field.length)
    
                possitions.push([x, y]);
           }
        }
    
        return possitions;
    }

    getRightTopDiagonal(position, rWeight = 0, tWeight = 0) {
        const [x, y] = position;

        const result = {
            direction: [x + 1, y - 1],
            weight: 0,
            isUndefined: false,
        }

        if (this.field[y - 1] && this.field[y - 1][x + 1] != undefined) {
            const neighborWeights = (rWeight + tWeight - FieldCreator.EMPTY_CELL_WEIGHT*2) / 2;

            result.weight = this.field[y - 1][x + 1] * Math.SQRT2 + neighborWeights;
        } else {
            result.isUndefined = true;
        }

        return result;
    }

    getLeftTopDiagonal(position, lWeight = 0, tWeight = 0) {
        const [x, y] = position;

        const result = {
            direction: [x - 1, y - 1],
            weight: 0,
            isUndefined: false,
        }

        if (this.field[y - 1] && this.field[y - 1][x - 1] != undefined) {
            const neighborWeights = (lWeight + tWeight - FieldCreator.EMPTY_CELL_WEIGHT*2) / 2;
            
            result.weight = this.field[y - 1][x - 1] * Math.SQRT2 + neighborWeights;
        } else {
            result.isUndefined = true;
        }

        return result;
    }

    getRightBottomDiagonal(position, rWeight = 0, bWeight = 0) {
        const [x, y] = position;

        const result = {
            direction: [x + 1, y + 1],
            weight: 0,
            isUndefined: false,
        }

        if (this.field[y + 1] && this.field[y + 1][x + 1] != undefined) {
            const neighborWeights = (rWeight + bWeight - FieldCreator.EMPTY_CELL_WEIGHT*2) / 2;

            result.weight = this.field[y + 1][x + 1] * Math.SQRT2 + neighborWeights;
        } else {
            result.isUndefined = true;
        }

        return result;
    }

    getLeftBottomDiagonal(position, lWeight = 0, bWeight = 0) {
        const [x, y] = position;

        const result = {
            direction: [x - 1, y + 1],
            weight: 0,
            isUndefined: false,
        }

        if (this.field[y + 1] && this.field[y + 1][x - 1] != undefined) {
            const neighborWeights = (lWeight + bWeight - FieldCreator.EMPTY_CELL_WEIGHT*2) / 2;

            result.weight = this.field[y + 1][x - 1] * Math.SQRT2 + neighborWeights;
        } else {
            result.isUndefined = true;
        }

        return result;
    }

    getUp(position) {
        const [x, y] = position;

        const result = {
            direction: [x, y - 1],
            weight: 0,
            isUndefined: false,
        }

        if (this.field[y - 1] && this.field[y - 1][x] != undefined) {
            result.weight = this.field[y - 1][x];
        } else {
            result.isUndefined = true;
        }

        return result;
    }

    getDown(position) {
        const [x, y] = position;

        const result = {
            direction: [x, y + 1],
            weight: 0,
            isUndefined: false,
        }

        if (this.field[y + 1] && this.field[y + 1][x] != undefined) {
            result.weight = this.field[y + 1][x];
        } else {
            result.isUndefined = true;
        }

        return result;

    }

    getLeft(position) {
        const [x, y] = position;

        const result = {
            direction: [x - 1, y],
            weight: 0,
            isUndefined: false,
        }

        if (this.field[y] && this.field[y][x - 1] != undefined) {
            result.weight = this.field[y][x - 1];
        } else {
            result.isUndefined = true;
        }

        return result;
    }

    getRight(position) {
        const [x, y] = position;

        const result = {
            direction: [x + 1, y],
            weight: 0,
            isUndefined: false,
        }

        if (this.field[y] && this.field[y][x + 1] != undefined) {
            result.weight = this.field[y][x + 1];
        } else {
            result.isUndefined = true;
        }

        return result;
    }

    isVisited(position) {
        return this.visited[position[0] + position[1] * this.field[0].length];
    }

    visit(position) {
        this.visited[position[0] + position[1] * this.field[0].length] = 1;
    }


    getAviableDirections(position) {
        const result = [];

        const up = this.getUp(position);
        const down = this.getDown(position);
        const left = this.getLeft(position);
        const right = this.getRight(position);

        if (!this.disableCross) {
            result.push(up);
            result.push(down);
            result.push(left);
            result.push(right);
        }

        if (!this.disableDiagonals) {
            result.push(this.getLeftTopDiagonal(position, left.weight, up.weight));
            result.push(this.getRightTopDiagonal(position, right.weight, up.weight));
            result.push(this.getLeftBottomDiagonal(position, left.weight, down.weight));
            result.push(this.getRightBottomDiagonal(position, right.weight, down.weight));
        }

        return result.filter(node => {
            // filter undefined nodes
            if (node.isUndefined) {
                return false;
            }

            // skip calclulation for unreachable nodes for optimization
            if (this.skipInfinityNeighbors && node.weight === Infinity) {
                return false;
            }

            const [x, y] = node.direction;

            return !this.visited[x + y * this.field[0].length];
        })
    }
}

class FieldDrawer {
    static VISITED = 'visited';
    static PATH = 'path';
    static OBSTACLE = 'obstacle';
    static POSSIBLE_PATHS = 'possible_paths';
    static START = 'start';
    static END = 'end';

    static randomColorRgb = () => {
        const random = () => Math.floor(Math.random() * 255);
    
        return {
            r: random(),
            g: random(),
            b: random(),
        }
    }

    constructor(
        canvas,
        fieldForShape,
    ) {
        this.canvas = canvas;
        this.field = fieldForShape;

        this.clearField();
    }

    clearField() {
        this.field = this.field.map(row => row.map(cell => (
            {
                r: 255,
                g: 255,
                b: 255,
            }
        )));
    }

    fillField(positions, fill) {
        positions.forEach(position => {
            const [x, y] = position;

            this.field[y][x] = fill;
        });

        return this;
    }

    setMazeBackPath(backPath) {
        backPath.forEach(position => {
            const [x, y] = position;

            this.field[y][x] = position.color;
        });

        return this;
    }

    setVisited(visited) {
        this.fillField(visited, FieldDrawer.VISITED);

        return this;
    }

    setPath(path) {
        this.fillField(path, FieldDrawer.PATH);

        return this;
    }

    setObstaclePositions(obstaclePositions) {
        this.fillField(obstaclePositions, FieldDrawer.OBSTACLE);

        return this;
    }
    
    setPossiblePaths(possiblePaths) {
        this.fillField(possiblePaths, FieldDrawer.POSSIBLE_PATHS);

        return this;
    }

    setStartPosition(startPosition) {
        const [x, y] = startPosition;
        this.field[y][x] = FieldDrawer.START;

        return this;
    }


    setEndPosition(endPosition) {
        const [x, y] = endPosition;
        this.field[y][x] = FieldDrawer.END;

        return this;
    }

    draw() {
        canvas.clear();

        this.drawField();

        return this;
    }

    drawField = () => {
        const { WIDTH, HEIGHT } = Canvas;
        const cellWidth = WIDTH / this.field[0].length;
        const cellHeight = HEIGHT / this.field.length;
    
        for (let i = 0; i < this.field.length; i++) {
            for (let j = 0; j < this.field[i].length; j++) {
                const cell = this.field[i][j];
                let fillColor = null;
    
                if (cell === FieldDrawer.VISITED) {
                    // fillColor = { r: 200, g: 200, b: 200 };
                    this.canvas.strokeRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight, { r: 0, g: 0, b: 0}, 0.5);  
                    
                    continue;
                }
    
                if (cell === FieldDrawer.PATH) {
                    fillColor = { r: 100, g: 255, b: 0 };
    
                }
    
                if (cell === FieldDrawer.OBSTACLE) {
                    fillColor = { r: 0, g: 0, b: 0 };
                }
    
                if (cell === FieldDrawer.POSSIBLE_PATHS) {
                    fillColor = { r: 12, g: 140, b: 255 };
                }
    
                if (cell === FieldDrawer.START) {
                    fillColor = { r: 34, g: 224, b: 22 };
                }
    
                if (cell === FieldDrawer.END) {
                    fillColor = { r: 205, g: 55, b: 85 };
                }

                
                if (fillColor) {
                    this.canvas.drawRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight, fillColor);
                } else {
                    this.canvas.drawRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight, cell);
                }
            }
        }
    }

}

class PathFinder {
    static manhettenDistance = (a, b) => {
        const [ax, ay] = a;
        const [bx, by] = b;
    
        return Math.abs(ax - bx) + Math.abs(ay - by);
    }

    static euclideanDistance = (a, b) => {
        const [ax, ay] = a;
        const [bx, by] = b;

        return Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));
    }

    static chebyshevDistance = (a, b) => {
        const [ax, ay] = a;
        const [bx, by] = b;

        return Math.max(Math.abs(ax - bx), Math.abs(ay - by));
    }

    constructor(fieldCreator, fieldDrawer, fieldWalker) {
        this.heuristics = PathFinder.manhettenDistance;

        this.fieldCreator = fieldCreator;
        this.fieldDrawer = fieldDrawer;
        this.fieldWalker = fieldWalker; 

        this.paths = [];
        this.minPathIndex = null;
        this.isFinished = false;

        this.init();
    }

    init() {
        this.paths = this.fieldWalker.getAviableDirections(this.fieldCreator.startPosition).map(node => [node]);
        this.minPathIndex = null;
        this.isFinished = false;
    }

    setMinPathIndex() {
        let minPathIndex = null;
        let minPathLength = Infinity;

        for (let i = 0; i < this.paths.length; i++) {
            const path = this.paths[i];
            const lastNode = path.at(-1);

            let sum = 0;

            for (let j = 0; j < path.length; j++) {
                const node = path[j];
                sum += node.weight;
            }

            const pathLength = sum + this.heuristics(lastNode.direction, this.fieldCreator.endPosition);

            if (pathLength < minPathLength) {
                minPathIndex = i;
                minPathLength = pathLength;
            }
        }

        this.minPathIndex = minPathIndex;
    }

    findPath(animate = false) {

        // let startTime = performance.now();

        if (animate) {
            let loopInterval = null;

            loopInterval = setInterval(() => {
                this.loop();
                this.displayChanges();
                
                if (this.isFinished) {
                    clearInterval(loopInterval);
                    return;
                }
            });

            return;
        }

        const startTime = performance.now();

        let iterations = 0;

        while (!this.isFinished) {
            this.loop();
            iterations++;
        }

        this.displayChanges();

        console.log('path length', this.getMinPath().length);
        console.log('iterations', iterations);
        console.log('time', performance.now() - startTime);
    }

    indexOfMinimum(array) {
        if (array.length === 0) {
            return -1;
        }

        let minValue = array[0];
        let minIndex = 0;

        for (let i = 1; i < array.length; i++) {
            if (array[i] < minValue) {
                minIndex = i;
                minValue = array[i];
            }
        }

        return minIndex;
    }

    loop = () => {
        if (this.paths.length === 0) {
            this.isFinished = true;
            return;
        }

        this.setMinPathIndex();

        const minPath = this.getMinPath();

        if (this.minPathIndex === null) {
            this.stopLoop();
            this.keepOnlyMinPath();

            return;
        }

        const minPathTail = minPath.at(-1);

        if (this.fieldCreator.isOnEndPosition(minPathTail.direction)) {
            this.stopLoop();
            this.keepOnlyMinPath();

            return;
        }

        if (this.fieldWalker.isVisited(minPathTail.direction)) {
            this.paths.splice(this.minPathIndex, 1);

            return;
        }

        this.fieldWalker.visit(minPathTail.direction);

        const nextNodes = this.fieldWalker.getAviableDirections(minPathTail.direction);

        const nextPaths = nextNodes.map(node => [...minPath, node]);

        this.paths.splice(this.minPathIndex, 1, ...nextPaths);
    }

    stopLoop() {
        this.isFinished = true;
    }

    keepOnlyMinPath() {
        const minPath = this.getMinPath();

        this.paths.length = 0;
        this.paths.push(minPath);
        this.minPathIndex = 0;
    }

    displayChanges() {
        const minPath = this.getMinPath();

        this.fieldDrawer.clearField();

        this.fieldDrawer
            .setVisited(this.fieldWalker.getVisitedPossitions())
            .setStartPosition(this.fieldCreator.startPosition)
            .setPossiblePaths(this.paths.flat().map(node => node.direction))
            .setPath(minPath.map(node => node.direction))
            .setEndPosition(this.fieldCreator.endPosition)
            .setObstaclePositions(this.fieldCreator.getObstaclesPositions())
            .draw();
    }

    getMinPath() {
        return this.paths[this.minPathIndex] || [];
    }
}

const canvas = new Canvas(document.getElementById("canvas"));


const fieldCreator = new FieldCreator(
    60, 60, 
    [0, 0], 
    [59, 59]
);

const fieldDrawer = new FieldDrawer(canvas, fieldCreator.field);


const mazeFieldWalker = new FieldWalker(fieldCreator.field, {
    disableDiagonals: true,
});


const randomObstaclesChance = Math.random();

if (randomObstaclesChance < 0.2) {
    fieldCreator.setRandomObstacles(1000, Infinity);
} else {
    fieldCreator.maze(mazeFieldWalker, fieldDrawer);
}

const pathFinderfieldWalker = new FieldWalker(fieldCreator.field, {
    skipInfinityNeighbors: true,
});

const pathFinder = new PathFinder(fieldCreator, fieldDrawer, pathFinderfieldWalker);

pathFinder.findPath();


const getPossitionFromMouse = (e) => {
    const { offsetX, offsetY } = e;
    const { WIDTH, HEIGHT } = Canvas;
    const cellWidth = WIDTH / fieldCreator.field[0].length;
    const cellHeight = HEIGHT / fieldCreator.field.length;

    const x = Math.floor(offsetX / cellWidth);
    const y = Math.floor(offsetY / cellHeight);

    return [x, y];
}

let mousePosition = [0, 0];

canvas.canvas.onmousemove = (e) => {
    const position = getPossitionFromMouse(e);

    if (!pathFinder.isFinished || !fieldCreator.isFinished) {
        return;
    }

    const isMouseChangedPossition = mousePosition[0] === position[0] && mousePosition[1] === position[1]

    if (isMouseChangedPossition) {
        return;
    }

    if (fieldCreator.isOnObstaclePosition(position)) {
        return;
    }

    mousePosition = position;

    fieldCreator.endPosition = position;

    pathFinderfieldWalker.init();
    pathFinder.init();

    pathFinder.findPath();
}

canvas.canvas.onmousedown = (e) => {
    const position = getPossitionFromMouse(e);

    if (!pathFinder.isFinished || !fieldCreator.isFinished) {
        return;
    }

    if (fieldCreator.isOnObstaclePosition(position)) {
        return;
    }
    mousePosition = position;

    fieldCreator.endPosition = position;

    pathFinderfieldWalker.init();
    pathFinder.init();

    pathFinder.findPath(true);
}

// bug
// document.getElementById("generate-maze").onclick = () => {

//     if (!pathFinder.isFinished || !fieldCreator.isFinished) return;

//     pathFinderfieldWalker.init();
//     pathFinder.init();
//     mazeFieldWalker.init();

//     fieldCreator.maze(mazeFieldWalker, fieldDrawer);
// }