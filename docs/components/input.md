# Input

Classification: `level: "primitive"`, `family: "controls"`.

```text
visual/components/Input/
  Input.tsx          React component and public props
  Input.css          Field and label styling (imported from app/layout.tsx)
  Input.openui.tsx   OpenUI schema and two-way binding adapter
  Input.examples.ts  OpenUI examples, spread into `examples` in registry.ts
```

`Input.tsx` renders a native `<input type="text">` and imports nothing from OpenUI, the board or MCP.

## React API

| Prop | Type | Notes |
| --- | --- | --- |
| `value` | `string` | Required. The input is controlled |
| `onChange` | native `ChangeEventHandler` | Read the text from `event.target.value` |
| `label` | `string` | Visible `<label>` linked with `htmlFor`. A blank (empty or whitespace) label is ignored: `aria-label`/`aria-labelledby` apply, else `placeholder` becomes the accessible name |
| `aria-label`, `aria-labelledby` | `string` | The types require `label`, `aria-label` or `aria-labelledby` |
| `className`, `style` | as `<div>` | Both apply to the wrapper (root element), like the other components |
| `placeholder`, `disabled`, `name`, `id`, `ref`, other native attributes | as `<input>` | `type` is fixed to `text` |

```tsx
<Input label="Name" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" />
```

Hover, `:focus-visible` (2px `--ui-accent-solid` outline) and `:disabled` styling use semantic tokens, so light and dark themes need no extra rules.

## OpenUI API

```text
Input(value, placeholder?, disabled?, label?)
```

| Argument | Notes |
| --- | --- |
| `value` | A bare `$variable`, declared with a default. Typing writes to it |
| `placeholder` | Hint text |
| `disabled` | boolean |
| `label` | Visible label. Empty or blank, it is ignored: `placeholder` (or "Text input") is the accessible name |

```text
$name = ""
root = Stack([field, greeting])
field = Input($name, "Enter your name")
greeting = Text("Hello, " + $name)
```

### How binding works

`value` is wrapped in the SDK's `reactive()`, so a bare `$name` reaches the component as a binding instead of its current text. The adapter reads it with `useStateField()`; typing calls `field.setValue()`, which writes to the renderer's store. Every expression that reads `$name` re-renders, with no request to the assistant, the board or MCP. `@Reset($name)` restores the declared default. No custom store or events are involved.

Only a bare `$variable` is writable. An expression (`"a" + $x`) or a string literal is not a binding, so the adapter renders a **disabled** field showing that value and never writes. The adapter keys the SDK's non-reactive fallback field with a per-instance `useId()`, so Inputs never share state through a common field name. The field is also disabled while the document is streaming.

Two Inputs bound to the same `$variable` stay in sync; use one variable per field for independent values.

## Limitations

Text only: no numeric, password or email types, validation rules, icons, sizes, form submission or field wrappers. `validate()` does not flag a non-`$variable` first argument; it renders disabled instead.
