# Compiler Frontend

This project is a **compiler frontend** designed to parse, evaluate, and generate code for a custom programming language. It includes a **lexer**, **parser**, and **evaluator** to process source code and execute it. The compiler supports variable declarations, assignments (including compound assignments), expressions, and basic control structures.

---

## Features

### 1. **Lexer**
The lexer tokenizes the source code into meaningful tokens such as:
- **Keywords**: `int`, `float`, `print`, `function`, etc.
- **Operators**: `+`, `-`, `*`, `/`, `+=`, `-=`, `*=`, `/=`, `=`, etc.
- **Identifiers**: Variable and function names.
- **Literals**: Numbers, strings, etc.
- **Delimiters**: `;`, `{`, `}`, `(`, `)`.

### 2. **Parser**
The parser converts tokens into an **Abstract Syntax Tree (AST)**. It supports:
- Variable declarations and initializations.
- Assignment statements (including compound assignments like `+=`, `-=`).
- Arithmetic expressions (`+`, `-`, `*`, `/`).
- Print statements.
- Function declarations.

### 3. **Evaluator**
The evaluator processes the AST and executes the code. It supports:
- Variable storage and retrieval using a symbol table.
- Arithmetic operations.
- Compound assignments.
- Printing values to the console.

---

## File Structure

### **Frontend**
- **`lexer/lexer.js`**: Tokenizes the source code into tokens.
- **`parser/parser.js`**: Parses tokens into an AST.

### **Backend**
- **`codegen/codegen.js`**: Evaluates the AST and executes the code.

---

## How to run

npm run dev
