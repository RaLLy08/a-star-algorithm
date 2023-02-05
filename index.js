class Canvas {
    static WIDTH = 900;
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

const canvas = new Canvas(document.getElementById("canvas"));

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

    setRandomObstacles(weight = Infinity) {
        this.obstaclePositions = Array.from({ length: 200 }, () => this.getRadomPosition())
            .filter(([x, y]) => {
                const isOnStartPosition = x === this.startPosition[0] && y === this.startPosition[1];
                const isOnEndPosition = this.isOnEndPosition([x, y]);

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
    
    zeros() {
        return this.createFieldAndFill(0);
    }
}

const fieldCreator = new FieldCreator(
    30, 30, 
    [0, 0], 
    [21, 22]
);

// fieldCreator.setRandomObstacles();

const testObstacles = [
    [1, 0],[1, 1],[1, 2],[1, 3],[1, 4],[1, 5],[1, 6],[1, 7],[1, 8],
    [1, 9],[1, 10],[1, 11],[1, 12],[4, 4],[4, 5],[4, 6],[4, 7],[4, 8],
    [4, 9],[4, 10],[4, 11],[4, 12],[4, 13],[4, 14],[4, 15],[4, 16],[4, 17],
    [4, 18],[4, 19],[4, 20],[4, 21],[4, 22],[4, 23],[4, 24],[4, 25],[4, 26],
    [4, 27],[4, 28],[4, 29],[7, 0],[7, 1],[7, 2],[7, 3],[7, 4],[7, 5],[7, 6],
    [7, 7],[7, 8],[7, 9],[7, 10],[7, 11],[7, 12],[7, 13],[7, 14],[7, 15],[7, 16],[7, 17],
    [7, 18],[7, 19],[7, 20],[7, 21],[7, 22],[7, 23],[10, 10],[10, 11],
    [10, 12],[10, 13],[10, 14],[10, 15],[10, 16],[10, 17],[10, 18],
    [10, 19],[10, 20],[10, 21],[10, 22],[10, 23],[11, 23],[12, 23],[12, 24],[12, 25],[13, 25],
    [14, 25],[14, 26],[14, 27],[14, 27],[14, 28],[13, 28],[13, 29],[12, 29],[11, 29],
    ...Array.from({ length: 24 }, (_, i) => [14, i]),
    ...Array.from({ length: 28 }, (_, i) => [18, 2 + i]),
    ...Array.from({ length: 26 }, (_, i) => [24, 2 + i]),
    ...Array.from({ length: 8 }, (_, i) => [19 + i, 17]),
];

fieldCreator.obstaclePositions = testObstacles;
fieldCreator.setFieldObstaclesFromPositions();


class FieldWalker {
    constructor(field) {
        this.field = field;
        // Set
        this.visited = [];
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
        const isVisited = this.visited.some(visited => visited[0] === position[0] && visited[1] === position[1]);
        
        const result = []

        if (isVisited) {
            return result;
        }

        this.visited.push(position);

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

            return !this.visited.some(visited => visited[0] === x && visited[1] === y);
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

    setVisited(visited) {
        visited.forEach(position => {
            const [x, y] = position;
            this.field[y][x] = FieldDrawer.VISITED;
        });

        return this;
    }

    setPath(path) {
        path.forEach(position => {
            const [x, y] = position;
            this.field[y][x] = FieldDrawer.PATH;
        });

        return this;
    }

    setObstaclePositions(obstaclePositions) {
        obstaclePositions.forEach(position => {
            const [x, y] = position;
            this.field[y][x] = FieldDrawer.OBSTACLE;
        });

        return this;
    }

    setPossiblePaths(possiblePaths) {
        possiblePaths.forEach(position => {
            const [x, y] = position;
            this.field[y][x] = FieldDrawer.POSSIBLE_PATHS;
        });

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
                }
    
                if (cell === FieldDrawer.PATH) {
                    fillColor = { r: 0, g: 191, b: 255 };
    
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
                    fillColor = { r: 25, g: 255, b: 85 };
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

    constructor(fieldCreator) {
        this.fieldCreator = fieldCreator;
        this.fieldWalker = new FieldWalker(fieldCreator.field); 
        this.paths = this.fieldWalker.getAviableDirections(this.fieldCreator.startPosition).map(node => [node]);
        this.onFinish = () => {};

        this.minPathIndex = null;
        this.isFinished = false;
    }

    findPath() {
        let loopInterval = null;

        loopInterval = setInterval(() => {
            if (this.paths.length === 0) return;
    
            this.loop();
        });

        this.onFinish = () => {
            this.isFinished = true;

            console.log(`Total path length: ${this.paths[this.minPathIndex].length}`);

            clearInterval(loopInterval);
        }
    }

    setMinPathIndex(heuristics = PathFinder.manhettenDistance) {
        const pathWeighsSum = this.paths.map(path => path.reduce((acc, node) => {
            return acc + node.weight;
        }, 0) + heuristics(path[path.length - 1].direction, this.fieldCreator.endPosition));

        this.minPathIndex = pathWeighsSum.indexOf(Math.min(...pathWeighsSum));
    }

    loop = () => {
        this.setMinPathIndex()

        const minPath = this.paths[this.minPathIndex];

        const minPathTail = minPath[minPath.length - 1];

        this.displayChanges();


        if (this.fieldCreator.isOnEndPosition(minPathTail.direction)) {
            this.onFinish();
            
            return;
        }

        const nextNodes = this.fieldWalker.getAviableDirections(minPathTail.direction);

        const nextPaths = nextNodes.map(node => [...minPath, node]);

        this.paths.splice(this.minPathIndex, 1, ...nextPaths);
    }

    displayChanges() {
        const minPath = this.paths[this.minPathIndex];

        new FieldDrawer(
            canvas,
            this.fieldCreator,
        ).setVisited(this.fieldWalker.visited)
        .setObstaclePositions(this.fieldCreator.obstaclePositions)
        .setPath(minPath.map(node => node.direction))
        .setEndPosition(this.fieldCreator.endPosition)
        .setStartPosition(this.fieldCreator.startPosition)
        .draw();
    }
}

new PathFinder(fieldCreator).findPath();
