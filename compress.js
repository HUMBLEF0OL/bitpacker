
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
    return msgpack.encode(serializedTree);
};