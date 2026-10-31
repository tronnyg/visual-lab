# CodeBlock

Classification: `level: "composite"`, `family: "data-display"`.

```text
visual/components/CodeBlock/
  CodeBlock.tsx          React component and public props
  CodeBlock.css          Header, gutter, wrapping and scrolling (imported through styles/components.css)
  CodeBlock.openui.tsx   OpenUI schema: CodeBlock(code, language?, showLineNumbers?, copyable?, wrap?)
  CodeBlock.examples.ts  OpenUI examples, spread into `examples` in registry.ts
  CodeBlock.stories.tsx  Storybook stories
```

`CodeBlock.tsx` renders a native `pre` and `code` and imports nothing from OpenUI, the board or MCP; it composes the existing [Button](button.md) and [Icon](icon.md) for the copy button. It is a read-only viewer: it cannot be edited or run. There is **no syntax highlighting** and no highlighting dependency; `language` is descriptive metadata, shown as a label.

## React API

| Prop | Type | Default |
| --- | --- | --- |
| `code` | `string` | required |
| `language` | `string` | none |
| `showLineNumbers` | `boolean` | `false` |
| `copyable` | `boolean` | `false` |
| `wrap` | `boolean` | `false` |

```tsx
<CodeBlock code={"const total = items.length;"} language="typescript" showLineNumbers copyable />
```

`className`, `style` and other `div` attributes go to the outer element, and `ref` (React 19 ref-as-prop) points at it.

## Behavior

- **Whitespace.** Indentation, blank lines and runs of spaces are preserved (`white-space: pre`, `tab-size: 2`). `\r\n` is read as `\n`, and a final newline ends the last line rather than adding an empty one. Each line is a block `span`, so there are no newline characters between lines.
- **Header.** Shown when there is a `language` or a copy button; otherwise the block is just the code.
- **Line numbers.** Drawn by a CSS counter in a gutter sized to the number of digits, so they are never selected or copied and a wrapped line is numbered once.
- **Scrolling and wrapping.** By default long lines scroll sideways inside a focusable `role="region"` named "`<language>` code" (or "Code"), so the keyboard can scroll it and the block never widens its parent. With `wrap`, lines wrap and break inside long unbroken strings.
- **Styling.** `--ui-surface-muted` surface, `--ui-border` border, `--ui-text` code and `--ui-text-muted` gutter and label, in a system monospace stack. Only `--ui-*` tokens, so light and dark themes need no extra rules.

## Copy button

The button calls `navigator.clipboard.writeText(code)` with the original, unmodified `code` string.

| State | Button text | Announced (`role="status"`) |
| --- | --- | --- |
| idle | Copy | nothing |
| copied | Copied (with a check icon) | "Code copied to clipboard" |
| failed | Copy failed | "Could not copy the code" |

A refused permission, an insecure context or a missing Clipboard API all land in the `failed` state; nothing is thrown. There is no timer: the state returns to idle when the button loses focus or the pointer leaves it.

## OpenUI API

```text
CodeBlock(code, language?, showLineNumbers?, copyable?, wrap?)
```

| Argument | Notes |
| --- | --- |
| `code` | The source text. Write line breaks as `\n` and quotes as `\"` |
| `language` | Header label only |
| `showLineNumbers` | `true` numbers the lines |
| `copyable` | `true` shows the copy button |
| `wrap` | `true` wraps long lines |

```text
root = CodeBlock("const items = [1, 2, 3];\nconst total = items.length;", "typescript", true, true)
```

CodeBlock is accepted as a child of `Stack`, `Card` and `Grid`. Use [Markdown](markdown.md) for prose with a short snippet.

## Limitations

No syntax highlighting, line highlighting, diffs, file tabs, editing, folding or download. If highlighting is added later it should be an opt-in layer over the same `pre`/`code` structure.
