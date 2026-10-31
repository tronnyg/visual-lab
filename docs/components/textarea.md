# Textarea

Classification: `level: "primitive"`, `family: "controls"`.

```text
visual/components/Textarea/
  Textarea.tsx          React component and public props
  Textarea.css          Field and label styling (imported from app/layout.tsx)
  Textarea.openui.tsx   OpenUI schema and two-way binding adapter
  Textarea.examples.ts  OpenUI examples, spread into `examples` in registry.ts
```

`Textarea.tsx` renders a native `<textarea>` and imports nothing from OpenUI, the board or MCP. It follows [Input](input.md): same label rules, IDs, tokens and states.

## React API

| Prop | Type | Notes |
| --- | --- | --- |
| `value` | `string` | Required. The textarea is controlled |
| `onChange` | native `ChangeEventHandler` | Read the text from `event.target.value` |
| `label` | `string` | Visible `<label>` linked with `htmlFor`. A blank label is ignored: `aria-label`/`aria-labelledby` apply, else `placeholder` becomes the accessible name |
| `aria-label`, `aria-labelledby` | `string` | The types require `label`, `aria-label` or `aria-labelledby` |
| `rows` | `number` | Initial visible lines. Default `3` |
| `className`, `style` | as `<div>` | Both apply to the wrapper (root element) |
| `placeholder`, `disabled`, `name`, `id`, `maxLength`, `ref`, other native attributes | as `<textarea>` | |

```tsx
<Textarea label="Notes" value={notes} onChange={e => setNotes(e.target.value)} rows={4} />
```

The height is predictable: `rows` sets the initial size and the user can drag the corner to resize **vertically** (`resize: vertical`; width always follows the container). The field does not auto-grow; shadcn's `field-sizing: content` was deliberately not adopted. A disabled textarea cannot be resized. Hover, `:focus-visible` and `:disabled` styling use semantic tokens, so light and dark themes need no extra rules.

## OpenUI API

```text
Textarea(value, placeholder?, disabled?, label?, rows?)
```

| Argument | Notes |
| --- | --- |
| `value` | A bare `$variable`, declared with a default. Typing writes to it |
| `placeholder` | Hint text |
| `disabled` | boolean |
| `label` | Visible label. Blank, it is ignored: `placeholder` (or "Text area") is the accessible name |
| `rows` | Visible lines, 1 to 20 (rounded and clamped). Default 3 |

The first four arguments match `Input`; `rows` is last so the two stay interchangeable.

```text
$notes = ""
root = Stack([field, echo])
field = Textarea($notes, "Write your notes here", false, "Notes", 4)
echo = Text("You wrote: " + $notes, "muted", "caption")
```

Binding works exactly as for Input: `value` is `reactive()`, read with `useStateField()`; `@Reset($notes)` restores the declared default. Only a bare `$variable` is writable; an expression or literal renders a **disabled** textarea. Each instance keys the SDK's fallback field with its own `useId()`, so instances never share state. The field is also disabled while the document is streaming. Newlines are kept in the variable (`\n`). OpenUI has no string-length builtin (`@Count` counts array items, not characters), so a character counter is not possible from OpenUI alone.

## Limitations

No auto-grow, character counter, `resize` option, validation, or helper/error text.
