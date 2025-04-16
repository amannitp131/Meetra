export function parse(tokens) {
  let index = 0;
  const validTypes = new Set([
    'int', 'short', 'long', 'float', 'double',
    'char', 'bool', 'string', 'array','class'
  ]);

  function parseExpression() {
    let left = parsePrimaryExpression();
  
    while (tokens[index] && tokens[index].type === 'OPERATOR' && /^[+\-*/]$/.test(tokens[index].value)) {
      const operator = tokens[index++].value; // Consume the operator
      const right = parsePrimaryExpression(); // Parse the right-hand side
      left = {
        type: 'BinaryExpression',
        operator,
        left,
        right,
      };
    }
  
    return left;
  }
  
  function parsePrimaryExpression() {
    const token = tokens[index++];
    if (token.type === 'INT' || token.type === 'FLOAT') {
      return { type: 'Literal', value: parseFloat(token.value) };
    } else if (token.type === 'STRING') {
      return { type: 'Literal', value: token.value.slice(1, -1) }; // Remove quotes
    } else if (token.type === 'IDENTIFIER') {
      return { type: 'Identifier', name: token.value };
    } else {
      throw new Error(`Unexpected token in expression: ${JSON.stringify(token)}`);
    }
  }

  //////////////////////////////////////////
  //Type mismatch //////////////////////////
  //////////////////////////////////////////
  function validateTypeCompatibility(varType, initializer) {
    if (!initializer) return; 
    
    switch (varType) {
      case 'int':
      case 'short':
      case 'long':
        if (initializer.type !== 'Literal' || typeof initializer.value !== 'number' || !Number.isInteger(initializer.value)) {
          throw new Error(`Type mismatch: Expected '${varType}', got ${JSON.stringify(initializer)}`);
        }
        break;
      case 'float':
      case 'double':
        if (initializer.type !== 'Literal' || typeof initializer.value !== 'number') {
          throw new Error(`Type mismatch: Expected '${varType}', got ${JSON.stringify(initializer)}`);
        }
        break;
      case 'char':
        if (initializer.type !== 'Literal' || typeof initializer.value !== 'string' || initializer.value.length !== 1) {
          throw new Error(`Type mismatch: Expected 'char', got ${JSON.stringify(initializer)}`);
        }
        break;
      case 'bool':
        if (initializer.type !== 'Literal' || typeof initializer.value !== 'boolean') {
          throw new Error(`Type mismatch: Expected 'bool', got ${JSON.stringify(initializer)}`);
        }
        break;
      case 'string':
        if (initializer.type !== 'Literal' || typeof initializer.value !== 'string') {
          throw new Error(`Type mismatch: Expected 'string', got ${JSON.stringify(initializer)}`);
        }
        break;
      case 'array':
        if (!Array.isArray(initializer.value)) {
          throw new Error(`Type mismatch: Expected 'array', got ${JSON.stringify(initializer)}`);
        }
        break;
      default:
        throw new Error(`Unsupported type: ${varType}`);
    }
  }

   //////////////////////////////////////////
  //parese variable declaration /////////////
  //////////////////////////////////////////
  function parseVariableDeclaration() {
    const typeToken = tokens[index++];
    if (typeToken.type !== 'KEYWORD' || !validTypes.has(typeToken.value)) {
      throw new Error(`Expected valid type keyword, got: ${JSON.stringify(typeToken)}`);
    }
  
    const nameToken = tokens[index++];
    if (nameToken.type !== 'IDENTIFIER') {
      throw new Error(`Expected variable name, got: ${JSON.stringify(nameToken)}`);
    }
  
    let arraySize = null;
    if (tokens[index] && tokens[index].type === 'OPERATOR' && tokens[index].value === '[') {
      index++; // Consume the '['
      const sizeToken = tokens[index++];
      if (sizeToken.type !== 'INT') {
        throw new Error(`Expected array size, got: ${JSON.stringify(sizeToken)}`);
      }
      arraySize = parseInt(sizeToken.value, 10);
  
      const closeBracket = tokens[index++];
      if (!closeBracket || closeBracket.type !== 'OPERATOR' || closeBracket.value !== ']') {
        throw new Error(`Expected ']', got: ${JSON.stringify(closeBracket)}`);
      }
    }
  
    let initializer = null;
    if (tokens[index] && tokens[index].type === 'OPERATOR' && tokens[index].value === '=') {
      index++; // Consume the '='
      initializer = parseExpression();
      validateTypeCompatibility(typeToken.value, initializer); 
    }
  
    const semicolon = tokens[index++];
    if (!semicolon || semicolon.type !== 'OPERATOR' || semicolon.value !== ';') {
      throw new Error('Expected semicolon after variable declaration');
    }
  
    return {
      type: 'VariableDeclaration',
      varType: typeToken.value,
      name: nameToken.value,
      arraySize,
      initializer,
    };
  }

  //////////////////////////////////////////
  //parser function declaration ////////////
  //////////////////////////////////////////

  function parseFunctionDeclaration() {
    const functionToken = tokens[index++];
    if (functionToken.type !== 'KEYWORD' || functionToken.value !== 'function') {
      throw new Error(`Expected 'function', got: ${JSON.stringify(functionToken)}`);
    }
  
    const nameToken = tokens[index++];
    if (nameToken.type !== 'IDENTIFIER') {
      throw new Error(`Expected function name, got: ${JSON.stringify(nameToken)}`);
    }
  
    const openParen = tokens[index++];
    if (!openParen || openParen.type !== 'OPERATOR' || openParen.value !== '(') {
      throw new Error(`Expected '(', got: ${JSON.stringify(openParen)}`);
    }
  
    const parameters = [];
    while (tokens[index] && tokens[index].type !== 'OPERATOR' && tokens[index].value !== ')') {
      const typeToken = tokens[index++];
      if (typeToken.type !== 'KEYWORD' || !validTypes.has(typeToken.value)) {
        throw new Error(`Expected valid type keyword in parameter, got: ${JSON.stringify(typeToken)}`);
      }
  
      const nameToken = tokens[index++];
      if (nameToken.type !== 'IDENTIFIER') {
        throw new Error(`Expected parameter name, got: ${JSON.stringify(nameToken)}`);
      }
  
      parameters.push({
        type: 'Parameter',
        varType: typeToken.value,
        name: nameToken.value,
      });
  
      // Check for a comma or closing parenthesis
      if (tokens[index] && tokens[index].type === 'OPERATOR' && tokens[index].value === ',') {
        index++; // Consume the comma
      } else if (tokens[index] && tokens[index].type === 'OPERATOR' && tokens[index].value === ')') {
        break; // End of parameters
      } else {
        throw new Error(`Expected ',' or ')', got: ${JSON.stringify(tokens[index])}`);
      }
    }
  
    const closeParen = tokens[index++];
    if (!closeParen || closeParen.type !== 'OPERATOR' || closeParen.value !== ')') {
      throw new Error(`Expected ')', got: ${JSON.stringify(closeParen)}`);
    }
  
    const openBrace = tokens[index++];
    if (!openBrace || openBrace.type !== 'OPERATOR' || openBrace.value !== '{') {
      throw new Error(`Expected '{', got: ${JSON.stringify(openBrace)}`);
    }
  
    const body = [];
    while (tokens[index] && !(tokens[index].type === 'OPERATOR' && tokens[index].value === '}')) {
      body.push(parseStatement());
    }
  
    const closeBrace = tokens[index++];
    if (!closeBrace || closeBrace.type !== 'OPERATOR' || closeBrace.value !== '}') {
      throw new Error(`Expected '}', got: ${JSON.stringify(closeBrace)}`);
    }
  
    return {
      type: 'FunctionDeclaration',
      name: nameToken.value,
      parameters,
      body,
    };
  }

  // ///////////////////////////////////////////
  // // parse class definition/////////////////
  // /////////////////////////////////////////

  // function parseClassDefinition() {
  //   const classToken = tokens[index++];
  //   if (classToken.type !== 'KEYWORD' || classToken.value !== 'class') {
  //     throw new Error(`Expected 'class', got: ${JSON.stringify(classToken)}`);
  //   }
  
  //   const nameToken = tokens[index++];
  //   if (nameToken.type !== 'IDENTIFIER') {
  //     throw new Error(`Expected class name, got: ${JSON.stringify(nameToken)}`);
  //   }
  
  //   const openBrace = tokens[index++];
  //   if (!openBrace || openBrace.type !== 'OPERATOR' || openBrace.value !== '{') {
  //     throw new Error(`Expected '{' after class name, got: ${JSON.stringify(openBrace)}`);
  //   }
  
  //   const body = [];
  //   while (tokens[index] && !(tokens[index].type === 'OPERATOR' && tokens[index].value === '}')) {
  //     const current = tokens[index];
  //     if (current.type === 'KEYWORD' && validTypes.has(current.value)) {
  //       // Parse variable declaration
  //       body.push(parseVariableDeclaration());
  //     } else if (current.type === 'KEYWORD' && current.value === 'function') {
  //       // Parse function declaration
  //       body.push(parseFunctionDeclaration());
  //     } else {
  //       throw new Error(`Unexpected token in class body: ${JSON.stringify(current)}`);
  //     }
  //   }
  
  //   const closeBrace = tokens[index++];
  //   if (!closeBrace || closeBrace.type !== 'OPERATOR' || closeBrace.value !== '}') {
  //     throw new Error(`Expected '}' at the end of class definition, got: ${JSON.stringify(closeBrace)}`);
  //   }
  
  //   return {
  //     type: 'ClassDefinition',
  //     name: nameToken.value,
  //     body,
  //   };
  // }
  

///////////////////////////////////////////
//// Print statement /////////////////////
/////////////////////////////////////////
  function parsePrintStatement() {
    const printToken = tokens[index++];
    if (printToken.type !== 'KEYWORD' || printToken.value !== 'print') {
      throw new Error(`Expected 'print', got: ${JSON.stringify(printToken)}`);
    }
  
    const openParen = tokens[index++];
    if (!openParen || openParen.type !== 'OPERATOR' || openParen.value !== '(') {
      throw new Error(`Expected '(', got: ${JSON.stringify(openParen)}`);
    }
  
    const expression = parseExpression();
  
    const closeParen = tokens[index++];
    if (!closeParen || closeParen.type !== 'OPERATOR' || closeParen.value !== ')') {
      throw new Error(`Expected ')', got: ${JSON.stringify(closeParen)}`);
    }
  
    const semicolon = tokens[index++];
    if (!semicolon || semicolon.type !== 'OPERATOR' || semicolon.value !== ';') {
      throw new Error('Expected semicolon after print statement');
    }
  
    return {
      type: 'PrintStatement',
      expression,
    };
  }

  ///////////////////////////////////////
  /// Assignment operator //////////////
  /////////////////////////////////////

  function parseAssignmentStatement() {
    const identifierToken = tokens[index++];
    if (identifierToken.type !== 'IDENTIFIER') {
      throw new Error(`Expected variable name, got: ${JSON.stringify(identifierToken)}`);
    }
  
    const operatorToken = tokens[index++];
    if (!operatorToken || operatorToken.type !== 'OPERATOR') {
      throw new Error(`Expected assignment operator, got: ${JSON.stringify(operatorToken)}`);
    }
  
    let expression;
    if (operatorToken.value === '=') {
      // Simple assignment
      expression = parseExpression();
    } else if (/^[+\-*/]=$/.test(operatorToken.value)) {
      // Compound assignment (e.g., +=, -=, *=, /=)
      const operator = operatorToken.value[0]; // Extract the operator (e.g., '+' from '+=')
      const rightExpression = parseExpression();
      expression = {
        type: 'BinaryExpression',
        operator,
        left: { type: 'Identifier', name: identifierToken.value },
        right: rightExpression,
      };
    } else {
      throw new Error(`Unsupported assignment operator: ${JSON.stringify(operatorToken)}`);
    }
  
    const semicolon = tokens[index++];
    if (!semicolon || semicolon.type !== 'OPERATOR' || semicolon.value !== ';') {
      throw new Error('Expected semicolon after assignment statement');
    }
  
    return {
      type: 'AssignmentStatement',
      variable: identifierToken.value,
      expression,
    };
  }

  
  const ast = [];
while (index < tokens.length) {
  const current = tokens[index];
  if (current.type === 'KEYWORD' && validTypes.has(current.value)) {
    ast.push(parseVariableDeclaration()); 
  } else if (current.type === 'KEYWORD' && current.value === 'print') {
    ast.push(parsePrintStatement());
  } else if (current.type === 'IDENTIFIER') {
    ast.push(parseAssignmentStatement());
  }else {
    throw new Error(`Unexpected token: ${JSON.stringify(current)}`);
  }
}

return ast;

}