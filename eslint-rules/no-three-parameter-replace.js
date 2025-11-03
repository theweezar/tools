module.exports = {
  create(context) {
    return {
      CallExpression(node) {
        if (
          !(node.callee.object && node.callee.object.name === "server") &&
                    node.callee.type === "MemberExpression" &&
                    node.callee.property.name === "replace" &&
                    node.arguments.length === 3
        ) {
          context.report({
            node: node,
            message: "String.prototype.replace with three parameters is deprecated."
          });
        }
      }
    };
  }
};
