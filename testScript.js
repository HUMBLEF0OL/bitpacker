const fs = require('fs');
const path = require('path');
class TestScript {
    constructor(testDir = './test') {
        this.testDir = testDir;
        this.outputDir = path.join(__dirname, 'output')
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

    runTest(fileName) {
        const filePath = path.join(this.testDir, fileName);
        console.log(`\ntesting ${filePath}...`);

        try {
            const data = fs.readFileSync(filePath, 'utf-8');
            // core login
        } catch (err) {
            console.log('❌ Compression Failed:', err.message);
        }
    }

    runAllTests() {
        console.log("Starting Compression Algorith....\n");
        const testFiles = this.getTestFiles();
        testFiles.forEach(file => {
            this.runTest(file);
        })

        this.generateReport();
    }

    generateReport() {

    }
}

const tool = new TestScript();
tool.runAllTests();