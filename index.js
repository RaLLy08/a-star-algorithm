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
        this.ctx.fillText(text, x + 20, y + 20);
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

const createField = (w, h, fill = 0) => Array.from({ length: h }, () => Array.from({ length: w }, () => fill));


const startPosition = [0, 0];
const endPosition = [20, 20];

const field = createField(30, 30, 1);


const obstaclePositions = [
    [1, 0],
    [1, 1],
    [1, 2],
    [1, 3],
    [1, 4],
    [1, 5],
    [1, 6],
    [1, 7],
    [1, 8],
    [1, 9],
    [1, 10],
    [1, 11],
    [1, 12],
    [4, 4],
    [4, 5],
    [4, 6],
    [4, 7],
    [4, 8],
    [4, 9],
    [4, 10],
    [4, 11],
    [4, 12],
    [4, 13],
    [4, 14],
    [4, 15],
    [4, 16],
    [4, 17],
    [4, 18],
    [4, 19],
    [4, 20],
    [4, 21],
    [4, 22],
    [4, 23],
    [4, 24],
    [4, 25],
    [4, 26],
    [4, 27],
    [4, 28],
    [4, 29],
    [7, 0],
    [7, 1],
    [7, 2],
    [7, 3],
    [7, 4],
    [7, 5],
    [7, 6],
    [7, 7],
    [7, 8],
    [7, 9],
    [7, 10],
    [7, 11],
    [7, 12],
    [7, 13],
    [7, 14],
    [7, 15],
    [7, 16],
    [7, 17],
    [7, 18],
    [7, 19],
    [7, 20],
    [7, 21],
    [7, 22],
    [7, 23],
    [10, 10],
    [10, 11],
    [10, 12],
    [10, 13],
    [10, 14],
    [10, 15],
    [10, 16],
    [10, 17],
    [10, 18],
    [10, 19],
    [10, 20],
    [10, 21],
    [10, 22],
    [10, 23],
    [11, 23],
    [12, 23],
    [12, 24],
    [12, 25],
    [13, 25],
    [14, 25],
    [14, 26],
    [14, 27],
    [14, 27],
    [14, 28],
    [13, 28],
    [13, 29],
    [12, 29],
    [11, 29],
    ...Array.from({ length: 24 }, (_, i) => [14, i]),
    ...Array.from({ length: 28 }, (_, i) => [18, 2 + i]),
    ...Array.from({ length: 26 }, (_, i) => [24, 2 + i]),
    ...Array.from({ length: 8 }, (_, i) => [19 + i, 17]),
    
];

obstaclePositions.forEach(([x, y]) => field[y][x] = Infinity);


class FieldWalker {
    constructor(field) {
        this.field = field;
        this.visited = [];
    }

    getRightTopDiagonal(position) {
        const [x, y] = position;

        const result = {
            direction: [x + 1, y - 1],
            weight: Infinity,
        }

        if (this.field[y - 1] && this.field[y - 1][x + 1] != undefined) {
            result.weight = this.field[y - 1][x + 1] * 1.4;
        }

        return result;
    }

    getLeftTopDiagonal(position) {
        const [x, y] = position;

        const result = {
            direction: [x - 1, y - 1],
            weight: Infinity,
        }

        if (this.field[y - 1] && this.field[y - 1][x - 1] != undefined) {
            result.weight = this.field[y - 1][x - 1] * 1.4;
        }

        return result;
    }

    getRightBottomDiagonal(position) {
        const [x, y] = position;

        const result = {
            direction: [x + 1, y + 1],
            weight: Infinity,
        }

        if (this.field[y + 1] && this.field[y + 1][x + 1] != undefined) {
            result.weight = this.field[y + 1][x + 1] * 1.4;
        }

        return result;
    }

    getLeftBottomDiagonal(position) {
        const [x, y] = position;

        const result = {
            direction: [x - 1, y + 1],
            weight: Infinity,
        }

        if (this.field[y + 1] && this.field[y + 1][x - 1] != undefined) {
            result.weight = this.field[y + 1][x - 1] * 1.4;
        }

        return result;
    }

    
    getUp(position) {
        const [x, y] = position;

        const result = {
            direction: [x, y - 1],
            weight: Infinity,
        }

        if (this.field[y - 1] && this.field[y - 1][x] != undefined) {
            result.weight = this.field[y - 1][x];
        }

        return result;
    }

    getDown(position) {
        const [x, y] = position;

        const result = {
            direction: [x, y + 1],
            weight: Infinity,
        }

        if (this.field[y + 1] && this.field[y + 1][x] != undefined) {
            result.weight = this.field[y + 1][x];
        }

        return result;

    }

    getLeft(position) {
        const [x, y] = position;

        const result = {
            direction: [x - 1, y],
            weight: Infinity,
        }

        if (this.field[y] && this.field[y][x - 1] != undefined) {
            result.weight = this.field[y][x - 1];
        }

        return result;
    }

    getRight(position) {
        const [x, y] = position;

        const result = {
            direction: [x + 1, y],
            weight: Infinity,
        }

        if (this.field[y] && this.field[y][x + 1] != undefined) {
            result.weight = this.field[y][x + 1];
        }

        return result;
    }

    getAviableDirections(position) {
        const isVisited = this.visited.some(visited => visited[0] === position[0] && visited[1] === position[1]);
        
        if (isVisited) {
            return [];
        }

        this.visited.push(position);

        return [
            this.getRightTopDiagonal(position),
            this.getLeftTopDiagonal(position),
            this.getRightBottomDiagonal(position),
            this.getLeftBottomDiagonal(position),
            this.getUp(position),
            this.getDown(position),
            this.getLeft(position),
            this.getRight(position),
        ].filter(node => {
            if (node.weight === Infinity) {
                return false;
            }

            const [x, y] = node.direction;

            return !this.visited.some(visited => visited[0] === x && visited[1] === y);
        });
    }
}

const drawField = (canvas, field) => {
    const { WIDTH, HEIGHT } = Canvas;
    const cellWidth = WIDTH / field[0].length;
    const cellHeight = HEIGHT / field.length;

    for (let i = 0; i < field.length; i++) {
        for (let j = 0; j < field[i].length; j++) {
            const cell = field[i][j];
            let fillColor = null;

            if (cell === 'visited') {
                // fillColor = { r: 200, g: 200, b: 200 };
                canvas.strokeRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight, { r: 0, g: 0, b: 0}, 0.5);    
            }

            if (cell === 'path') {
                fillColor = { r: 0, g: 191, b: 255 };
            }

            if (cell === 'obstacle') {
                fillColor = { r: 0, g: 0, b: 0 };
            }

            if (i === startPosition[1] && j === startPosition[0]) {
                fillColor = { r: 34, g: 224, b: 22 };
            }

            if (i === endPosition[1] && j === endPosition[0]) {
                fillColor = { r: 25, g: 255, b: 85 };
            }
            
            if (fillColor) {
                canvas.drawRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight, fillColor);
            }
        }
    }
}

const drawGrid = (canvas, grid) => {
    const { WIDTH, HEIGHT } = Canvas;
    const cellWidth = WIDTH / grid[0].length;
    const cellHeight = HEIGHT / grid.length;

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            canvas.strokeRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight, { r: 0, g: 0, b: 255}, 0.2);
        }
    }
}

const manhettenDistance = (a, b) => {
    const [ax, ay] = a;
    const [bx, by] = b;

    return Math.abs(ax - bx) + Math.abs(ay - by);
}


const findPath = () => {
    const fw = new FieldWalker(field);

    const paths = fw.getAviableDirections(startPosition).map(node => [node]);
    let loopInterval = null;

    const loop = () => {
        const pathWeighsSum = paths.map(path => path.reduce((acc, node) => {
            return acc + node.weight + manhettenDistance(node.direction, endPosition);
        }, 0));
        const minPathIndex = pathWeighsSum.indexOf(Math.min(...pathWeighsSum));

        const path = paths[minPathIndex];

        const tail = path[path.length - 1];

        const fieldMap = createField(field[0].length, field.length);

        fw.visited.forEach(visited => {
            const [x, y] = visited;

            fieldMap[y][x] = 'visited';
        });

        path.forEach(node => {
            const [x, y] = node.direction;

            fieldMap[y][x] = 'path';
        });

        obstaclePositions.forEach(obstacle => {
            const [x, y] = obstacle;

            fieldMap[y][x] = 'obstacle';
        });

        canvas.clear();

        // drawGrid(canvas, field);
        drawField(canvas, fieldMap);

        if (tail.direction[0] === endPosition[0] && tail.direction[1] === endPosition[1]) {
            
            console.log((`Total path length: ${path.length}`))

            clearInterval(loopInterval);
        }

        const nextNodes = fw.getAviableDirections(tail.direction);

        const nextPaths = nextNodes.map(node => [...path, node]);

        paths.splice(minPathIndex, 1, ...nextPaths);
        
        // console.log(paths)
    }

    setTimeout(() => {
        loopInterval = setInterval(() => {
            if (paths.length === 0) return;
    
            loop();
        }, 0);
    }, 1000);

}

findPath();



// drawField(canvas, field);