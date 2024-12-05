const Node = require("./Node");

const frequencyAnalysis = (data) => {
    const map = new Map();
    for (const ch of data) {
        map.set(ch, (map.get(ch) || 0) + 1);
    }
    console.log('frequency: ', map);

    return map;
}


const generatePriorityQueue = (frequency) => {
    // const heap = frequency.map(([key, value]) => new Node(key, value));
    const heap = [];
    frequency.forEach((value, key) => {
        heap.push(new Node(key, value));
    });
    heap.sort((a, b) => a.freq - b.freq);
    console.log("generated heap: ", heap);
    return heap;
}



module.exports = {
    frequencyAnalysis,
    generatePriorityQueue
}