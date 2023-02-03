const startNode = {
    id: 0, // field position
    weight: 0,
    head: true,
};

const graphNodes = [
    {
        id: 1, // field position
        weight: 4,
    },
    {
        id: 2,
        weight: 2,
    },
    {
        id: 3,
        weight: 3,
    },
    {
        id: 4,
        weight: 3,
    },
    {
        id: 5,
        weight: 1,
    },
    {
        id: 6,
        weight: 2,
    },
    {
        id: 7,
        weight: 2,
    },
    {
        id: 8,
        weight: 1,
    },
    {
        id: 9,
        weight: 2,
    },
    {
        id: 10,
        weight: 4,
    },
    {
        id: 11,
        weight: 4,
    },
    {
        id: 12,
        weight: 100,
    }
];

const graphEdges = [
    {
        from: 0,
        to: 1,
    },
    {
        from: 0,
        to: 2,
    },
    {
        from: 0,
        to: 11,
    },
    {   
        from: 0,
        to: 6,
    },
    {
        from: 2,
        to: 3,
    },
    {
        from: 2,
        to: 4,
    },
    {   
        from: 4,
        to: 5,
    },
    {
        from: 6,
        to: 7,
    },
    {
        from: 6,
        to: 8,
    },
    {
        from: 8,
        to: 9,
    },
    {
        from: 8,
        to: 10,
    },
    {
        from: 3,
        to: 12,
    },
];


class Graph {
    constructor(nodes, edges) {
        this.nodes = nodes;
        this.edges = edges;
    }

    getNodes() {
        return this.nodes;
    }

    getEdges() {
        return this.edges;
    }

    getNeighbourEdges(nodeId) {
        return this.edges.filter(edge => edge.from === nodeId);
    }

    getNeighbourNodes(nodeId) {
        return this.getNeighbourEdges(nodeId).map(edge => this.getNode(edge.to));
    }

    getNode(nodeId) {
        return this.nodes.find(node => node.id === nodeId);
    }
}



// initial paths

const findPath = () => {
    const graph = new Graph(graphNodes, graphEdges);
    const paths = graph.getNeighbourNodes(startNode.id).map(node => [node]);

    while (paths.length > 0) {
        const pathWeighsSum = paths.map(path => path.reduce((acc, node) => acc + node.weight, 0));
        const minPathIndex = pathWeighsSum.indexOf(Math.min(...pathWeighsSum));

        const path = paths[minPathIndex];

        const tail = path[path.length - 1];

        const nextNodes = graph.getNeighbourNodes(tail.id);

        const nextPaths = nextNodes.map(node => [...path, node]);

        paths.splice(minPathIndex, 1, ...nextPaths);
    }
}


findPath()