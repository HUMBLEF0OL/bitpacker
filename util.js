const PdfParse = require("pdf-parse");
const Node = require("./Node");
const fs = require('fs');
const { performance } = require('perf_hooks');

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

const extractTextFromPdf = (filePath) => {
    const pdfBuffer = fs.readFileSync(filePath);
    return PdfParse(pdfBuffer).then(data => {
        return data.text; // Extracted text from the PDF
    }).catch(err => {
        console.error('Error extracting text from PDF:', err);
    });
}

const formatFileSize = (bytes) => {
    if (bytes < 1024) {
        return `${bytes} bytes`;
    } else if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(2)} KB`;
    } else if (bytes < 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    } else {
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
}

// Function to calculate compression metrics
function calculateCompressionMetrics(originalSize, compressedSize, startTime) {
    // Calculate compression ratio
    const compressionRatio = (originalSize / compressedSize).toFixed(2);
    const savings = (((originalSize - compressedSize) / originalSize) * 100).toFixed(2);

    // Calculate time taken for compression
    const endTime = performance.now();
    const timeTaken = ((endTime - startTime) / 1000).toFixed(2); // In seconds

    // Return the metrics
    return {
        originalSize: formatFileSize(originalSize),
        compressedSize: formatFileSize(compressedSize),
        compressionRatio: compressionRatio,
        timeTaken: `${timeTaken} seconds`,
        savings: `${savings}%`
    };
}




module.exports = {
    frequencyAnalysis,
    generatePriorityQueue,
    extractTextFromPdf,
    formatFileSize,
    calculateCompressionMetrics
}