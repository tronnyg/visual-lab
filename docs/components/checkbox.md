# Checkbox

Classification: `level: "primitive"`, `family: "controls"`.

```text
visual/components/Checkbox/
  Checkbox.tsx          React component and public props
  Checkbox.css          Box, checkmark and state styling (imported from app/layout.tsx)
  Checkbox.openui.tsx   OpenUI schema and two-way binding adapter
  Checkbox.examples.ts  OpenUI examples, spread into `examples` in registry.ts
```

`Checkbox.tsx` renders a native `<input type="checkbox">` inside a `<label>` and imports nothing from OpenUI, the board or MCP. Toggling with Space and clicking the label text are native behavior.

## React API

| Prop | Type | Notes |
| --- | --- | --- |
| `checked` | `boolean` | Required. The checkbox is controlled |
| `onCheckedChange` | `(checked: boolean, event) => void` | Called with the new state |
| `label` | `string` | Visible text; the wrapping `<label>` makes it clickable. A blank label is ignored |
| `aria-label`, `aria-labelledby` | `string` | The types require `label`, `aria-label` or `aria-labelledby` |
| `className`, `style` | as `<label>` | Both apply to the wrapper (root element) |
| `disabled`, `name`, `id`, `ref`, other native attributes | as `<input>` | `type`, `value` and `onChange` are managed by the component |

```tsx
<Checkbox label="I agree" checked={agreed} onCheckedChange={setAgreed} />
```

The box uses `appearance: none` with a CSS checkmark. Checked fills with `--ui-accent-solid` and the mark uses `--ui-on-accent`, so light and dark themes need no extra rules. Hover (unchecked and enabled), `:focus-visible` (2px outline) and `:disabled` states are styled.

## OpenUI API

```text
Checkbox(checked, label, disabled?)
```

| Argument | Notes |
| --- | --- |
| `checked` | A bare boolean `$variable`, declared with a default. Toggling writes `true`/`false` |
| `label` | Required visible text |
| `disabled` | boolean |

```text
$agree = false
root = Stack([box, status])
box = Checkbox($agree, "I agree to the terms")
status = Text($agree ? "Thanks, you agreed." : "Not agreed yet.", "muted")
```

`checked` is wrapped in `reactive()` and read with `useStateField()`; every expression that reads the variable updates immediately, and `@Reset($agree)` restores the declared default. Only a bare `$variable` is writable. An expression or literal renders a **disabled** checkbox showing that value. Each instance keys the SDK's fallback field with its own `useId()`, so instances never share state. The checkbox is also disabled while the document is streaming. Two checkboxes bound to the same `$variable` stay in sync.

## Limitations

No indeterminate state, CheckboxGroup, helper or error text, or sizes.
