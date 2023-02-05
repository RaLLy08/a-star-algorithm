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
    static EMPTY_CELL_WEIGHT = 1;

    constructor(width, height, startPosition, endPosition) {
        this.width = width;
        this.height = height;
        this.startPosition = startPosition || this.getRadomPosition();
        this.endPosition = endPosition || this.getRadomPosition();
        this.field = this.createFieldAndFill();
        this.obstaclePositions = [];
    }

    createFieldAndFill(fill = FieldCreator.EMPTY_CELL_WEIGHT) {
        return Array.from({ length: this.height }, () => Array.from({ length: this.width }, () => fill));
    }

    setRandomObstacles(count = 200, weight = Infinity) {
        this.obstaclePositions = Array.from({ length: count }, () => this.getRadomPosition());

        this.obstaclePositions = this.obstaclePositions.filter(position => {
            const isOnStartPosition = this.isOnStartPosition(position);
            const isOnEndPosition = this.isOnEndPosition(position);

            return !isOnStartPosition && !isOnEndPosition;
        });
            

        this.setFieldObstaclesFromPositions(weight);
    }

    setFieldObstaclesFromPositions(weight = Infinity) {
        this.field = this.createFieldAndFill();

        this.obstaclePositions.forEach(([x, y]) => this.field[y][x] = weight);
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
        return this.obstaclePositions.some(([obstacleX, obstacleY]) => obstacleX === x && obstacleY === y);
    }
        
    
    zeros() {
        return this.createFieldAndFill(0);
    }
}

class FieldWalker {
    constructor(fieldCreator) {
        this.field = fieldCreator.field;
        this.visited = new Int8Array(fieldCreator.field.length * fieldCreator.field[0].length);
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

    getAviableDirections(position) {
        const isVisited = this.visited[position[0] + position[1] * this.field[0].length];
        
        const result = []

        if (isVisited) {
            return result;
        }

        this.visited[position[0] + position[1] * this.field[0].length] = 1;

        const up = this.getUp(position);
        const down = this.getDown(position);
        const left = this.getLeft(position);
        const right = this.getRight(position);

        result.push(up);
        result.push(down);
        result.push(left);
        result.push(right);
        result.push(this.getLeftTopDiagonal(position, left.weight, up.weight));
        result.push(this.getRightTopDiagonal(position, right.weight, up.weight));
        result.push(this.getLeftBottomDiagonal(position, left.weight, down.weight));
        result.push(this.getRightBottomDiagonal(position, right.weight, down.weight));

        return result.filter(node => {
            // filter undefined nodes
            if (node.isUndefined) {
                return false;
            }

            // filter unreachable nodes
            if (node.weight === Infinity) {
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

    constructor(
        canvas,
        fieldCreator,
    ) {
        this.canvas = canvas;
        this.fieldCreator = fieldCreator;

        this.visited = [];
        this.path = [];
        this.obstaclePositions = [];

        this.field = fieldCreator.zeros();
    }

    fillField(positions, fill) {
        positions.forEach(position => {
            const [x, y] = position;

            this.field[y][x] = fill;
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

    clearField() {
        this.field = this.fieldCreator.zeros();
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

    constructor(fieldCreator, fieldDrawer, fieldWalker) {
        this.heuristics = PathFinder.manhettenDistance;

        this.fieldCreator = fieldCreator;
        this.fieldDrawer = fieldDrawer;
        this.fieldWalker = fieldWalker; 

        this.paths = [];
        this.minPathIndex = null;
        this.isFinished = false;
        this.isStarted = false;

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
            const lastNode = path[path.length - 1];
            const pathLength = path.length + this.heuristics(lastNode.direction, this.fieldCreator.endPosition);

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

        const minPathTail = minPath[minPath.length - 1];

        if (this.fieldCreator.isOnEndPosition(minPathTail.direction)) {
            this.stopLoop();
            this.keepOnlyMinPath();

            return;
        }

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
            .setObstaclePositions(this.fieldCreator.obstaclePositions)
            .setStartPosition(this.fieldCreator.startPosition)
            .setPossiblePaths(this.paths.flat().map(node => node.direction))
            .setPath(minPath.map(node => node.direction))
            .setEndPosition(this.fieldCreator.endPosition)
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
    [21, 22]
);

fieldCreator.setRandomObstacles(1000);

// const testObstacles = [
//     [1, 0],[1, 1],[1, 2],[1, 3],[1, 4],[1, 5],[1, 6],[1, 7],[1, 8],
//     [1, 9],[1, 10],[1, 11],[1, 12],[4, 4],[4, 5],[4, 6],[4, 7],[4, 8],
//     [4, 9],[4, 10],[4, 11],[4, 12],[4, 13],[4, 14],[4, 15],[4, 16],[4, 17],
//     [4, 18],[4, 19],[4, 20],[4, 21],[4, 22],[4, 23],[4, 24],[4, 25],[4, 26],
//     [4, 27],[4, 28],[4, 29],[7, 0],[7, 1],[7, 2],[7, 3],[7, 4],[7, 5],[7, 6],
//     [7, 7],[7, 8],[7, 9],[7, 10],[7, 11],[7, 12],[7, 13],[7, 14],[7, 15],[7, 16],[7, 17],
//     [7, 18],[7, 19],[7, 20],[7, 21],[7, 22],[7, 23],[10, 10],[10, 11],
//     [10, 12],[10, 13],[10, 14],[10, 15],[10, 16],[10, 17],[10, 18],
//     [10, 19],[10, 20],[10, 21],[10, 22],[10, 23],[11, 23],[12, 23],[12, 24],[12, 25],[13, 25],
//     [14, 25],[14, 26],[14, 27],[14, 27],[14, 28],[13, 28],[13, 29],[12, 29],[11, 29],
//     ...Array.from({ length: 24 }, (_, i) => [14, i]),
//     ...Array.from({ length: 28 }, (_, i) => [18, 2 + i]),
//     ...Array.from({ length: 26 }, (_, i) => [24, 2 + i]),
//     ...Array.from({ length: 8 }, (_, i) => [19 + i, 17]),
// ];

// fieldCreator.obstaclePositions = testObstacles;
// fieldCreator.setFieldObstaclesFromPositions();

const fieldDrawer = new FieldDrawer(canvas, fieldCreator);
const fieldWalker = new FieldWalker(fieldCreator);

const pathFinder = new PathFinder(fieldCreator, fieldDrawer, fieldWalker);

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

    if (!pathFinder.isFinished) {
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

    fieldWalker.init();
    pathFinder.init();

    pathFinder.findPath();
}

canvas.canvas.onmousedown = (e) => {
    const position = getPossitionFromMouse(e);

    if (!pathFinder.isFinished) {
        return;
    }


    if (fieldCreator.isOnObstaclePosition(position)) {
        return;
    }
    mousePosition = position;

    fieldCreator.endPosition = position;

    fieldWalker.init();
    pathFinder.init();

    pathFinder.findPath(true);
}