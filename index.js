#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const { frequencyAnalysis, generatePriorityQueue, calculateCompressionMetrics } = require('./util');
const {
    generateHuffmanTree,
    generateCodes,
    encodeData,
    serializeTreeToBinary,
    saveCompressedOutput
} = require('./compress');
const {
    decodeData,
    deserializedBinaryToTree,
    saveDecodedOutput,
    bufferToBinaryString
} = require('./decompress');

const program = new Command();

// Function to compress a file
const compressFile = async (inputPath, outputDir) => {
    const startTime = performance.now(); // Start time to calculate the compression time

    try {
        console.log(`\nCompressing file: ${inputPath}...`);

        // Read the input file
        const data = fs.readFileSync(inputPath, 'utf-8');
        const fileExtension = path.extname(inputPath);

        // Record the original file size
        const originalSize = fs.statSync(inputPath).size; // In bytes

        // Generate Huffman Tree and codes
        const frequency = frequencyAnalysis(data);
        const heap = generatePriorityQueue(frequency);
        const tree = generateHuffmanTree(heap);
        const codes = generateCodes(tree);
        const compressedData = encodeData(data, codes);

        const serializedTree = serializeTreeToBinary(tree, fileExtension);



        // Save compressed file
        const fileName = path.basename(inputPath, path.extname(inputPath));
        const compressedSize = await saveCompressedOutput(inputPath, compressedData, serializedTree, outputDir);

        // Calculate compression metrics
        const metrics = calculateCompressionMetrics(originalSize, compressedSize, startTime);

        // Log compression metrics
        console.log(`✅ Compression successful.`);
        console.log(`Files saved to: ${outputDir}`);
        console.log(`Original File Size: ${metrics.originalSize}`);
        console.log(`Compressed File Size: ${metrics.compressedSize}`);
        console.log(`Compression Ratio: ${metrics.compressionRatio}`);
        console.log(`Storage Saving: ${metrics.savings}`);
        console.log(`Time Taken: ${metrics.timeTaken}`);

    } catch (err) {
        console.error(`❌ Compression failed: ${err.message}`);
    }
}

const decompressFile = async (inputDir, outputDir) => {
    try {
        console.log(`\nDecompressing file from: ${inputDir}...`);

        const encodedFile = path.join(inputDir, 'encoded.bin');
        const metaFile = path.join(inputDir, 'metaData.bin');

        if (!fs.existsSync(encodedFile) || !fs.existsSync(metaFile)) {
            throw new Error("Missing compressed files (encoded.bin or metaData.bin) in input directory.");
        }

        // Read compressed data and metadata
        const compressedDataBuffer = fs.readFileSync(encodedFile);
        const serializedTree = fs.readFileSync(metaFile);

        // Deserialize the Huffman tree and decode data
        const compressedData = bufferToBinaryString(compressedDataBuffer);
        const { tree, fileExtension } = deserializedBinaryToTree(serializedTree);
        const decodedData = decodeData(compressedData, tree);

        // Save the decoded output
        const outputFileName = `decoded${fileExtension}`;
        const result = await saveDecodedOutput(outputFileName, decodedData, outputDir);

        console.log(`✅ Decompression successful. File saved to: ${outputDir}\\${outputFileName}`);
    } catch (err) {
        console.error(`❌ Decompression failed: ${err.message}`);
    }
};

// Setup CLI commands
program
    .name('huffman-compressor')
    .description('A command-line tool to compress and decompress files using the Huffman coding algorithm.')
    .version('1.0.0');

// Compress Command
program
    .command('compress')
    .alias('c')
    .description('Compress a text file')
    .argument('<inputFile>', 'Input file to compress')
    .option('-o, --output <directory>', 'Output directory for compressed files', './output')
    .action((inputFile, options) => {
        const outputDir = path.resolve(options.output);
        compressFile(path.resolve(inputFile), outputDir);
    });

// Decompress Command
program
    .command('decompress')
    .alias('d')
    .description('Decompress a compressed file')
    .argument('[inputDir]', 'Directory containing encoded.bin and metaData.bin') // Optional argument
    .option('-o, --output <directory>', 'Output directory for decompressed file', './output')
    .action((inputDir, options) => {
        // If no inputDir is provided, default to the current directory
        const inputDirectory = path.resolve(inputDir || './');
        const outputDir = path.resolve(options.output);
        decompressFile(inputDirectory, outputDir);
    });



program.parse(process.argv);
