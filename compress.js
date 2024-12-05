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

const serializeTreeToBinary = (root) => {
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
    const result = msgpack5.encode(serializedTree);
    // console.log("binary serialized: ", typeof result);
    return result;
};


const saveCompressedOutput = async (filePath, data, metaInfo) => {
    const fileName = path.basename(filePath, path.extname(filePath));
    const dirPath = path.join(__dirname, 'output', fileName);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    const compressed = path.join(dirPath, 'encoded.bin');
    const metaFile = path.join(dirPath, 'metaData.bin');
    const binaryData = binaryStringToBuffer(data);

    try {
        await fs.promises.writeFile(metaFile, metaInfo);
        console.log('Metadata saved successfully');

        await fs.promises.writeFile(compressed, binaryData);
        console.log('Compressed data saved successfully');

        const compressedStats = fs.statSync(compressed);
        const metaStats = fs.statSync(metaFile);

        const totalSize = compressedStats.size + metaStats.size;

        console.log(`Combined size of encoded.bin and metaData.bin: ${totalSize} bytes`);
        return totalSize;
    } catch (err) {
        console.error('Error saving files:', err.message);
        throw err;
    }
}
// Convert a binary string (e.g., "101010") to a Buffer
const binaryStringToBuffer = (binaryString) => {
    const byteArray = [];
    for (let i = 0; i < binaryString.length; i += 8) {
        // Take 8 bits at a time and convert to a number
        const byte = binaryString.slice(i, i + 8);
        byteArray.push(parseInt(byte, 2));
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