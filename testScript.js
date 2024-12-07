const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const {
    frequencyAnalysis,
    generatePriorityQueue,
    extractTextFromPdf,
} = require('./util');
const {
    generateHuffmanTree,
    generateCodes,
    encodeData,
    serializeTreeToBinary,
    saveCompressedOutput,
} = require('./compress');
const {
    decodeData,
    deserializedBinaryToTree,
    saveDecodedOutput,
} = require('./decompress');

class TestScript {
    constructor(testDir = './test', outputDir = './output') {
        this.testDir = testDir;
        this.outputDir = outputDir;
        this.report = [];
    }

    // Retrieve files in the test directory
    getTestFiles() {
        try {
            const files = fs.readdirSync(this.testDir);
            console.log("📂 Files found in test directory:", files);
            return files;
        } catch (err) {
            console.error("❌ Failed to read files from test directory:", err.message);
            process.exit(1);
        }
    }

    // Get file size for a given file path
    getFileSize(filePath) {
        try {
            const stats = fs.statSync(filePath);
            return stats.size;
        } catch (err) {
            console.error("❌ Failed to get file size:", err.message);
            return 0;
        }
    }

    // Generate a single report entry
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

    // Core function to test compression and decompression for a single file
    async runTest(fileName) {
        const filePath = path.join(this.testDir, fileName);
        const fileExtension = path.extname(filePath);
        console.log(`\n🚀 Running test for file: ${filePath}`);

        try {
            let originalData;
            // Extract text-based content, PDF requires special handling
            if (fileExtension === '.pdf') {
                originalData = await extractTextFromPdf(filePath);
                if (!originalData) throw new Error("Failed to extract text from PDF");
            } else {
                originalData = fs.readFileSync(filePath, 'utf-8');
            }

            const originalSize = this.getFileSize(filePath);

            // Compression process
            const compressionStart = performance.now();
            const frequency = frequencyAnalysis(originalData);
            const heap = generatePriorityQueue(frequency);
            const tree = generateHuffmanTree(heap);
            const codes = generateCodes(tree);
            const compressedData = encodeData(originalData, codes);
            const metaData = serializeTreeToBinary(tree, fileExtension);

            const compressedSize = await saveCompressedOutput(
                fileName,
                compressedData,
                metaData,
                `${this.outputDir}/compress`
            );
            const compressionEnd = performance.now();

            // Decompression process
            const decompressionStart = performance.now();
            const { tree: deserializedTree, fileExtension: extension } = deserializedBinaryToTree(metaData);
            const decompressedData = decodeData(compressedData, deserializedTree);

            const decompressedSize = await saveDecodedOutput(
                fileName,
                decompressedData,
                `${this.outputDir}/decompress`
            );
            const decompressionEnd = performance.now();

            // Verify accuracy
            const isAccurate = originalData === decompressedData;

            // Record metrics
            const reportEntry = this.generateReportEntry(
                fileName,
                originalSize,
                compressedSize,
                compressionEnd - compressionStart,
                decompressionEnd - decompressionStart,
                isAccurate
            );
            this.report.push(reportEntry);

            console.log("✔️ Test completed successfully:", reportEntry);
        } catch (err) {
            console.error(`❌ Test failed for ${fileName}:`, err.message);
            this.report.push({
                fileName,
                error: err.message,
            });
        }
    }

    // Run tests on all files in the test directory
    runAllTests() {
        console.log("\n📊 Starting Compression and Decompression Tests...");
        const testFiles = this.getTestFiles();
        testFiles.forEach((file) => this.runTest(file));
    }

    // Save the metrics report to a file
    generateReport() {
        const reportPath = path.join(this.outputDir, 'compression_metrics.json');
        try {
            if (!fs.existsSync(this.outputDir)) {
                fs.mkdirSync(this.outputDir, { recursive: true });
            }
            fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2), 'utf-8');
            console.log("\n📈 Metrics report saved to:", reportPath);
        } catch (err) {
            console.error("❌ Failed to save metrics report:", err.message);
        }
    }
}

// Initialize and run the tests
(async () => {
    const testScript = new TestScript('./test', './output');
    await testScript.runAllTests();
    testScript.generateReport();
})();
