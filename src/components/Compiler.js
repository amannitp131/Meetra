"use client";
import { useState } from "react";
import { tokenize } from "../frontend/lexer/lexer";
import { parse } from "../frontend/parser/parser";
import { evaluate } from "../backend/codegen/codegen";

export default function Compiler() {
  const [source, setSource] = useState("");
  const [output, setOutput] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dividerPosition, setDividerPosition] = useState(50); 

  const runCompiler = () => {
    try {
      const tokens = tokenize(source);
      const ast = parse(tokens);
      const result = evaluate(ast);
      setOutput(
        `Result:\n${result}\n\n` +
          `Tokens:\n${JSON.stringify(tokens, null, 2)}\n\n` +
          `AST:\n${JSON.stringify(ast, null, 2)}\n\n`
      );
    } catch (err) {
      setOutput(`Error: ${err.message}`);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleDividerDrag = (e) => {
    const newDividerPosition = (e.clientX / window.innerWidth) * 100;
    if (newDividerPosition > 10 && newDividerPosition < 90) {
      setDividerPosition(newDividerPosition);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        isDarkMode
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-black"
      } flex flex-col`}
    >
      <div className="flex justify-between items-center p-4">
        <h1 className="text-xl font-bold">Compiler</h1>
        <button
          onClick={toggleTheme}
          className={`py-1 px-3 rounded-lg ${
            isDarkMode
              ? "bg-gray-700 text-white hover:bg-gray-600"
              : "bg-purple-600 text-white hover:bg-purple-700"
          }`}
        >
          Toggle {isDarkMode ? "Light" : "Dark"} Mode
        </button>
      </div>
      <div className="flex flex-grow relative">
        <div
          className="h-full flex flex-col"
          style={{
            width: `${dividerPosition}%`,
            transition: "width 0.2s",
          }}
        >
          <textarea
            rows="20"
            className={`w-full h-full p-4 border ${
              isDarkMode
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white text-black border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 ${
              isDarkMode
                ? "focus:ring-gray-500"
                : "focus:ring-purple-500 focus:border-transparent"
            } resize-none font-mono text-sm`}
            placeholder="Write your code here..."
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
          <button
            onClick={runCompiler}
            className={`mt-4 w-full py-2 px-4 rounded-lg ${
              isDarkMode
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-purple-600 text-white hover:bg-purple-700"
            } focus:outline-none focus:ring-2 ${
              isDarkMode
                ? "focus:ring-gray-500"
                : "focus:ring-purple-500 focus:ring-offset-2"
            } transition`}
          >
            Run
          </button>
        </div>
        <div
          className="absolute top-0 bottom-0 bg-gray-500 cursor-col-resize"
          style={{ left: `${dividerPosition}%`, width: "5px" }}
          onMouseDown={(e) => {
            e.preventDefault();
            document.addEventListener("mousemove", handleDividerDrag);
            document.addEventListener("mouseup", () => {
              document.removeEventListener("mousemove", handleDividerDrag);
            });
          }}
        ></div>
        <div
          className="h-full overflow-auto"
          style={{
            width: `${100 - dividerPosition}%`,
            transition: "width 0.2s",
          }}
        >
          <pre
            className={`h-full p-4 rounded-lg overflow-auto text-sm font-mono ${
              isDarkMode
                ? "bg-gray-700 text-white"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {output}
          </pre>
        </div>
      </div>
    </div>
  );
}