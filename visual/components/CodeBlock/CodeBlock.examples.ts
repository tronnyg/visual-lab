// Positional args: CodeBlock(code, language, showLineNumbers, copyable, wrap)
export const codeBlockExamples = [
  {
    title: "Code block",
    code: 'root = CodeBlock("const items = [1, 2, 3];\\nconst total = items.length;\\nconsole.log(total);", "typescript", true, true)',
  },
  {
    title: "Shell command",
    code: 'root = CodeBlock("npm install\\nnpm run dev", "bash", null, true)',
  },
  {
    title: "Code block with wrapped lines",
    code: 'root = CodeBlock("The quick brown fox jumps over the lazy dog, and then keeps running along a very long line that would otherwise scroll sideways.", "text", false, false, true)',
  },
  {
    title: "Code block in a card",
    code: 'root = Card(null, null, [title, code])\ntitle = Text("Example request", "default", "subheading")\ncode = CodeBlock("{\\n  \\"status\\": \\"ok\\",\\n  \\"count\\": 3\\n}", "json", false, true)',
  },
] as const;
