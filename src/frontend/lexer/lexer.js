export function tokenize(source) {
  const tokens = [];
  const tokenRegex = /\s*("(?:[^"\\]|\\.)*"|=>|[+\-*/]=|[-+*/=();{}\[\]]|\d+(\.\d+)?|[a-zA-Z_]\w*)\s*/g;

  const keywords = new Set([
    'int', 'short', 'long', 'float', 'double',
    'char', 'bool', 'string', 'array', 'function', 'class', 'print'
  ]);

  let match;

  while ((match = tokenRegex.exec(source)) !== null) {
    const value = match[1];
    let type;

    if (/^"(?:[^"\\]|\\.)*"$/.test(value)) {
      type = 'STRING';
    } else if (/^\d+(\.\d+)?$/.test(value)) {
      type = value.includes('.') ? 'FLOAT' : 'INT';
    } else if (/^[+\-*/]=|[-+*/=();{}\[\]]$/.test(value)) {
      type = 'OPERATOR';
    } else if (keywords.has(value)) {
      type = 'KEYWORD';
    } else if (/^[a-zA-Z_]\w*$/.test(value)) {
      type = 'IDENTIFIER';
    } else {
      throw new Error(`Unknown token: ${value}`);
    }

    tokens.push({ type, value });
  }

  return tokens;
}