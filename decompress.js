const msgpack5 = require("msgpack5")();
const path = require('path');
const fs = require('fs');
const Node = require("./Node");

const bufferToBinaryString = (buffer) => {
    return buffer
        .toString('binary') // Convert to binary string
        .split('')
        .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0')) // Each char -> binary
        .join('');
};

const decodeData = (encoded, tree) => {
    let decodedData = '';
    let currentNode = tree;

    if (tree.left === null && tree.right === null) {
        for (let bit of encoded) {
            decodedData += tree.char;
        }
        return decodedData;
    }

    for (let bit of encoded) {
        currentNode = bit === '0' ? currentNode.left : currentNode.right;

        if (currentNode.char !== null) {
            decodedData += currentNode.char;
            currentNode = tree;
        }
    }
    // console.log("decoded data: ", decodedData);
    return decodedData;
}

const deserializedBinaryToTree = (buffer) => {
    const deserializeNode = (data) => {
        if (!data) return null;

        if (data.marker === 0x01) {
            // Leaf node
            return new Node(data.char, data.freq);
        }

        // Internal node
        return new Node(
            null,
            data.freq,
            deserializeNode(data.left),
            deserializeNode(data.right)
        );
    };

    const metaData = msgpack5.decode(buffer);
    const tree = deserializeNode(metaData.tree);
    const fileExtension = metaData.fileExtension;

    return {
        tree,
        fileExtension
    }
};


const deserializeTree = (tree) => {
    if (!tree) return null;
    const root = new Node(tree.char, tree.freq);
    const queue = [{ node: root, tree }];

    while (queue.length > 0) {
        const { node, tree } = queue.shift();

        if (tree?.left) {
            node.left = new Node(tree.left.char, tree.left.freq);
            queue.push({ node: node.left, data: tree.left });
        }
        if (tree?.right) {
            node.right = new Node(tree.right.char, tree.right.freq);
            queue.push({ node: node.right, data: tree.right });
        }
    }
    // console.log("deserialized tree: ", root);
    return root;
}


const saveDecodedOutput = async (fileName, data, outputDir) => {
    try {
        // Create the directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Define the decoded file path
        const decodedFile = path.join(outputDir, fileName);

        // Write the decoded data to the file
        await fs.promises.writeFile(decodedFile, data);

        // Fetch file size and return it along with the file path
        const fileSize = fs.statSync(decodedFile).size;

        console.log(`✅ Decoded file saved at: ${decodedFile}`);
        console.log(`📏 Decoded file size: ${fileSize} bytes`);

        return fileSize;
    } catch (err) {
        console.error('❌ Error saving decoded file:', err.message);
        throw err; // Re-throw for upstream error handling
    }
};


module.exports = {
    bufferToBinaryString,
    decodeData,
    deserializeTree,
    deserializedBinaryToTree,
    saveDecodedOutput
}