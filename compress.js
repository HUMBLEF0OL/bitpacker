const msgpack5 = require("msgpack5")();
const path = require('path');
const fs = require('fs');
const Node = require("./Node");

const generateHuffmanTree = (heap) => {
    while (heap.length > 1) {
        const smallest = heap.shift();
        const secondSmallest = heap.shift();

        // merged
        const merged = new Node(null, smallest.freq + secondSmallest.freq, smallest, secondSmallest);
        heap.sort((a, b) => a.freq - b.freq);

        heap.push(merged);
    }
    // console.log("tree: ", heap[0]);
    return heap[0];
}

const generateCodes = (tree) => {
    const codes = new Map();

    const stack = [{ node: tree, prefix: '' }];
    if (tree.left === null && tree.right === null) {
        codes.set(tree.char, '0');
        return codes;
    }

    while (stack.length > 0) {
        const { node, prefix } = stack.pop();

        if (node.char !== null) {
            codes.set(node.char, prefix);
        } else {
            if (node.left !== null) {
                stack.push({ node: node.left, prefix: prefix + '0' });
            }
            if (node.right !== null) {
                stack.push({ node: node.right, prefix: prefix + '1' });
            }
        }
    }
    // console.log("codes: ", codes);
    return codes;

}

const encodeData = (data, codes) => {
    let encodedData = '';
    for (const ch of data) {
        encodedData += codes.get(ch)
    }
    // console.log("encoded data: ", encodedData);
    return encodedData;
}

const serializeTree = (tree) => {
    const stack = [tree];
    const map = new Map();
    if (!tree) return null;

    while (stack.length > 0) {
        const node = stack[stack.length - 1];
        if (node.left && !map.has(node.left)) stack.push(node.left);
        else if (node.right && !map.has(node.right)) stack.push(node.right);
        else {
            stack.pop();
            map.set(node, {
                char: node.char,
                freq: node.freq,
                left: node.left ? map.get(node.left) : null,
                right: node.right ? map.get(node.right) : null
            })
        }
    }
    // console.log("serialize tree: ", map.get(tree));
    return map.get(tree);
}

const serializeTreeToBinary = (root, fileExtension) => {
    const serializeNode = (node) => {
        if (!node) return null;

        if (node.char !== null) {
            // Leaf node
            return {
                marker: 0x01,
                char: node.char,
                freq: node.freq,
            };
        }

        // Internal node
        return {
            marker: 0x00,
            freq: node.freq,
            left: serializeNode(node.left),
            right: serializeNode(node.right),
        };
    };

    const serializedTree = serializeNode(root);
    // Include the file extension
    const metadata = {
        tree: serializedTree,
        fileExtension: fileExtension,
    };

    // Encode using msgpack
    const result = msgpack5.encode(metadata);

    return result;
};


// Function to save compressed output and return combined size
const saveCompressedOutput = async (inputFilePath, compressedData, metaInfo, outputDir) => {
    const fileName = path.basename(inputFilePath, path.extname(inputFilePath));
    const dirPath = path.join(outputDir, fileName);

    // Create output directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    // Define file paths
    const encodedFilePath = path.join(dirPath, 'encoded.bin');
    const metaFilePath = path.join(dirPath, 'metaData.bin');
    const binaryData = binaryStringToBuffer(compressedData);

    try {
        // Save meta information
        await fs.promises.writeFile(metaFilePath, metaInfo);
        console.log('✅ Metadata saved successfully');

        // Save compressed binary data
        await fs.promises.writeFile(encodedFilePath, binaryData);
        console.log('✅ Compressed data saved successfully');

        // Calculate file sizes
        const compressedStats = fs.statSync(encodedFilePath);
        const metaStats = fs.statSync(metaFilePath);
        const totalSize = compressedStats.size + metaStats.size;

        console.log(`🔍 Combined size of encoded.bin and metaData.bin: ${(totalSize / 1024).toFixed(2)} KB`);
        return totalSize;
    } catch (err) {
        console.error('❌ Error saving files:', err.message);
        throw err;
    }
};

// Helper function: Convert a binary string (e.g., "101010") to a Buffer
const binaryStringToBuffer = (binaryString) => {
    const byteArray = [];
    for (let i = 0; i < binaryString.length; i += 8) {
        const byte = binaryString.slice(i, i + 8); // Take 8 bits at a time
        byteArray.push(parseInt(byte, 2)); // Convert binary to a number
    }
    return Buffer.from(byteArray);
};

module.exports = {
    generateHuffmanTree,
    generateCodes,
    encodeData,
    serializeTree,
    serializeTreeToBinary,
    saveCompressedOutput
}