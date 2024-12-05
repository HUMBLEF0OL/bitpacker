const msgpack5 = require("msgpack5")();
const path = require('path');
const fs = require('fs');
const Node = require("./Node");

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

    const decodedTree = msgpack5.decode(buffer);
    return deserializeNode(decodedTree);
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

const saveDecodedOutput = async (filePath, data) => {
    const fileName = path.basename(filePath, path.extname(filePath));
    const fileExtension = path.extname(filePath);
    const dirPath = path.join(__dirname, 'output', fileName);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    const decodedFile = path.join(dirPath, `decoded${fileExtension}`);
    try {
        await fs.promises.writeFile(decodedFile, data);
        const fileSize = fs.statSync(decodedFile).size;

        console.log("decoded file size: ", fileSize);
        return fileSize;
    } catch (err) {
        console.error('Error saving files:', err.message);
    }
}

module.exports = {
    decodeData,
    deserializeTree,
    deserializedBinaryToTree,
    saveDecodedOutput
}