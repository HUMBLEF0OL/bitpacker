const PdfParse = require("pdf-parse");
const Node = require("./Node");
const fs = require('fs');

const frequencyAnalysis = (data) => {
    const map = new Map();
    for (const ch of data) {
        map.set(ch, (map.get(ch) || 0) + 1);
    }
    // console.log('frequency: ', map);

    return map;
}


const generatePriorityQueue = (frequency) => {
    // const heap = frequency.map(([key, value]) => new Node(key, value));
    const heap = [];
    frequency.forEach((value, key) => {
        heap.push(new Node(key, value));
    });
    heap.sort((a, b) => a.freq - b.freq);
    // console.log("generated heap: ", heap);
    return heap;
}

function extractTextFromPdf(filePath) {
    const pdfBuffer = fs.readFileSync(filePath);
    return PdfParse(pdfBuffer).then(data => {
        return data.text; // Extracted text from the PDF
    }).catch(err => {
        console.error('Error extracting text from PDF:', err);
    });
}

// helper for determining the correct file size


module.exports = {
    frequencyAnalysis,
    generatePriorityQueue,
    extractTextFromPdf
}