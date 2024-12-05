const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const { frequencyAnalysis, generatePriorityQueue } = require('./util');
const { generateHuffmanTree, generateCodes, encodeData, serializeTree, serializeTreeToBinary, saveCompressedOutput } = require('./compress');
const { decodeData, deserializeTree, deserializedBinaryToTree, saveDecodedOutput } = require('./decompress');
class TestScript {
    constructor(testDir = './test') {
        this.testDir = testDir;
        this.outputDir = path.join(__dirname, 'output')
        this.report = []
    }

    getTestFiles() {
        try {
            const files = fs.readdirSync(this.testDir);
            console.log("files are: ", files);
            return files;
        } catch (err) {
            console.log("failed to read files from directory: ", this.testDir);
            process.exit(1);
        }
    }

    getFileSize(filePath) {
        try {
            const stats = fs.statSync(filePath);
            return stats.size;
        } catch (err) {
            console.error("Failed to get file size:", err.message);
            return 0;
        }
    }

    generateReportEntry(fileName, originalSize, compressedSize, compressionTime, decompressionTime, accuracy) {
        const compressionRatio = (originalSize / compressedSize).toFixed(2);
        const savings = (((originalSize - compressedSize) / originalSize) * 100).toFixed(2);

        return {
            fileName,
            originalSize: `${(originalSize / 1024).toFixed(2)} KB`,
            compressedSize: `${(compressedSize / 1024).toFixed(2)} KB`,
            compressionRatio,
            savings: `${savings}%`,
            compressionTime: `${compressionTime.toFixed(2)} ms`,
            decompressionTime: `${decompressionTime.toFixed(2)} ms`,
            accuracy: accuracy ? "✔️ Matches Original" : "❌ Does Not Match",
        };
    }

    generateCompressedFile(fileName) {
        const data = fs.readFileSync(filePath, 'utf-8');
        // preprocessing of data
        const frequency = frequencyAnalysis(data);
        const heap = generatePriorityQueue(frequency);
        const tree = generateHuffmanTree(heap);
        const codes = generateCodes(tree);
        const compressed = encodeData(data, codes);
        const binarySerializedTree = serializeTreeToBinary(tree);
        saveCompressedOutput(fileName, compressed, binarySerializedTree);
    }

    generateOriginalFile(encodedData, tree) {
        const binaryDeserializedTree = deserializedBinaryToTree(tree);
        const decodeFromBuffer = decodeData(encodedData, binaryDeserializedTree);

    }

    async runTest(fileName) {
        const filePath = path.join(this.testDir, fileName);
        console.log(`\ntesting ${filePath}...`);

        try {
            const originalData = fs.readFileSync(filePath, 'utf-8');
            const originalSize = this.getFileSize(filePath);

            // Compression process
            const compressionStart = performance.now();
            const frequency = frequencyAnalysis(originalData);
            const heap = generatePriorityQueue(frequency);
            const tree = generateHuffmanTree(heap);
            const codes = generateCodes(tree);
            const compressedData = encodeData(originalData, codes);
            const binarySerializedTree = serializeTreeToBinary(tree);
            const compressedSize = await saveCompressedOutput(fileName, compressedData, binarySerializedTree);
            const compressionEnd = performance.now();


            // Decompression process
            const decompressionStart = performance.now();
            const deserializedTree = deserializedBinaryToTree(binarySerializedTree);
            const decompressedData = decodeData(compressedData, deserializedTree);
            const decompressedSize = await saveDecodedOutput(fileName, decompressedData);
            const decompressionEnd = performance.now();


            // Accuracy Check
            const isAccurate = originalData === decompressedData;

            // Generate Metrics Report
            const reportEntry = this.generateReportEntry(
                fileName,
                originalSize,
                compressedSize,
                compressionEnd - compressionStart,
                decompressionEnd - decompressionStart,
                isAccurate
            );
            this.report.push(reportEntry);

            console.log("✔️ Test completed:", reportEntry);
            this.generateReport();
        } catch (err) {
            console.log(`❌ Compression Failed: ${err.message}`);
            this.report.push({
                fileName,
                error: err.message,
            });
        }
    }

    runAllTests() {
        console.log("Starting Compression Algorithm....\n");
        const testFiles = this.getTestFiles();
        testFiles.forEach(file => {
            this.runTest(file);
        })

        // this.generateReport();
    }

    generateReport() {
        const reportPath = path.join(this.outputDir, 'compression_metrics.json');
        try {
            if (!fs.existsSync(this.outputDir)) {
                fs.mkdirSync(this.outputDir, { recursive: true });
            }
            fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2), 'utf-8');
            console.log("\n📊 Metrics Report saved at:", reportPath);
        } catch (err) {
            console.error("❌ Failed to save metrics report:", err.message);
        }
    }
}

const tool = new TestScript();
tool.runAllTests();