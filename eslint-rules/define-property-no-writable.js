module.exports = {
    create(context) {
        return {
            CallExpression(node) {
                if (
                    node.callee.type === 'MemberExpression' &&
                    node.callee.property.name === 'defineProperty' &&
                    node.arguments.length > 0 &&
                    node.arguments[node.arguments.length - 1].type === 'ObjectExpression'
                ) {
                    let properties = node.arguments[node.arguments.length - 1].properties;
                    let hasWritable = properties.some(prop => {
                        return prop.key && prop.key.name === 'writable';
                    });

                    if (!hasWritable) {
                        context.report({
                            node: node,
                            message: "Object.defineProperty must set writable to true."
                        });
                    }
                }
            }
        };
    }
};
