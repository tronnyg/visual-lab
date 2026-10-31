# Select

Classification: `level: "primitive"`, `family: "controls"`.

```text
visual/components/Select/
  Select.tsx          React component and public props
  Select.css          Field, chevron and state styling (imported from app/layout.tsx)
  Select.openui.tsx   OpenUI schema and two-way binding adapter
  Select.examples.ts  OpenUI examples, spread into `examples` in registry.ts
```

`Select.tsx` renders a native `<select>` and imports nothing from OpenUI, the board or MCP. The popup list, keyboard handling (arrows, Home/End, typeahead, Enter, Escape) and screen-reader behavior are the browser's own; there is no custom dropdown, portal or listbox.

## React API

| Prop | Type | Notes |
| --- | --- | --- |
| `value` | `string` | Required. The selected option's value. The select is controlled |
| `options` | `{label: string, value: string, disabled?: boolean}[]` | Required. Choices in display order |
| `onValueChange` | `(value: string, event) => void` | Called with the chosen option's value |
| `placeholder` | `string` | Shown, and not selectable, while `value` matches no option. Without it the closed control is blank |
| `label` | `string` | Visible `<label>` linked with `htmlFor`. A blank label is ignored |
| `aria-label`, `aria-labelledby` | `string` | The types require `label`, `aria-label` or `aria-labelledby` |
| `className`, `style` | as `<div>` | Both apply to the wrapper (root element) |
| `disabled`, `name`, `id`, `ref`, other native attributes | as `<select>` | `multiple` and `size` are not supported |

```tsx
<Select label="Country" value={country} onValueChange={setCountry} options={[{label: "Canada", value: "ca"}, {label: "Peru", value: "pe"}]} placeholder="Choose a country" />
```

A value that matches no option would make the browser silently show the first option; the component instead selects a hidden, disabled empty option, so the closed control shows `placeholder` (or nothing). The styling matches [Input](input.md) (32px, same border, hover and `:focus-visible` outline); the chevron is a CSS mask in `--ui-text-muted`, and options get `--ui-surface` and `--ui-text`, so light and dark themes need no extra rules. The native popup is drawn by the browser and its exact appearance varies by browser and OS.

## OpenUI API

```text
Select(value, options, label?, disabled?, placeholder?)
```

| Argument | Notes |
| --- | --- |
| `value` | A bare string `$variable`, declared with a default equal to one option's value, or `""` to start on the placeholder |
| `options` | Array of strings (label and value are the same text) or `{label, value}` objects. The two forms can be mixed |
| `label` | Visible label. Without it the accessible name is just "Select", so always set one |
| `disabled` | boolean |
| `placeholder` | Text shown while the variable matches no option |

The first four arguments match [RadioGroup](radio-group.md); `placeholder` is last.

```text
$lang = "ts"
root = Stack([field, choice])
field = Select($lang, [{label: "TypeScript", value: "ts"}, {label: "Python", value: "py"}], "Language")
choice = Text("Language code: " + $lang)
```

`value` is wrapped in `reactive()` and read with `useStateField()`; every expression that reads the variable updates immediately, and `@Reset($lang)` restores the declared default. Only a bare `$variable` is writable. An expression or literal renders a **disabled** select showing that value. Each instance keys the SDK's fallback field with its own `useId()`, so selects never share state. The select is also disabled while the document is streaming.

Use Select for about five or more options and RadioGroup for fewer, so all choices stay visible.

## Limitations

Single selection only: no multi-select, search or filtering, option groups, icons, descriptions, per-option `disabled` in OpenUI (the React API has it), or custom popup styling.
