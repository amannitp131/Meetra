export function evaluate(ast, symbolTable = {}) {
  if (!ast) {
    throw new Error('Invalid AST node: AST is undefined or null');
  }

  // If the AST is an array, evaluate each node in sequence
  if (Array.isArray(ast)) {
    let lastResult = null;
    for (const node of ast) {
      lastResult = evaluate(node, symbolTable);
    }
    return lastResult; // Return the result of the last evaluated node
  }

  switch (ast.type) {
    case 'Literal':
      return ast.value;

    case 'Identifier':
      if (symbolTable[ast.name] === undefined) {
        throw new Error(`Undefined variable: ${ast.name}`);
      }
      return symbolTable[ast.name].value;

    case 'VariableDeclaration':
      if (symbolTable[ast.name]) {
        throw new Error(`Variable already declared: ${ast.name}`);
      }
      symbolTable[ast.name] = {
        type: ast.varType,
        value: ast.initializer ? evaluate(ast.initializer, symbolTable) : null,
      };
      return null;

    case 'AssignmentStatement':
      if (!symbolTable[ast.variable]) {
        throw new Error(`Undefined variable: ${ast.variable}`);
      }
      const newValue = evaluate(ast.expression, symbolTable);
      symbolTable[ast.variable].value = newValue;
      return newValue;

    case 'PrintStatement':
      const value = evaluate(ast.expression, symbolTable);
      console.log(value); 
      return value;

    case 'FunctionDeclaration':
      symbolTable[ast.name] = ast;
      return null;

    case 'BinaryExpression':
      const leftValue = evaluate(ast.left, symbolTable);
      const rightValue = evaluate(ast.right, symbolTable);

      switch (ast.operator) {
        case '+':
          if (typeof leftValue === 'string' || typeof rightValue === 'string') {
            return String(leftValue) + String(rightValue);
          }
          return leftValue + rightValue;
        case '-':
          return leftValue - rightValue;
        case '*':
          return leftValue * rightValue;
        case '/':
          if (rightValue === 0) {
            throw new Error('Division by zero');
          }
          return leftValue / rightValue;
        default:
          throw new Error(`Unsupported operator: ${ast.operator}`);
      }

    default:
      throw new Error(`Unsupported AST node: ${JSON.stringify(ast)}`);
  }
}