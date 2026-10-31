# RadioGroup

Classification: `level: "primitive"`, `family: "controls"`.

```text
visual/components/RadioGroup/
  RadioGroup.tsx          React component and public props
  RadioGroup.css          Group, radio and state styling (imported from app/layout.tsx)
  RadioGroup.openui.tsx   OpenUI schema and two-way binding adapter
  RadioGroup.examples.ts  OpenUI examples, spread into `examples` in registry.ts
```

`RadioGroup.tsx` renders a `<fieldset>` with a `<legend>` around native `<input type="radio">` elements that share one generated `name`, and imports nothing from OpenUI, the board or MCP. There is no separate RadioItem component: options are data. Arrow-key navigation, Tab (one stop for the group), Space and label clicks are native browser behavior.

## React API

| Prop | Type | Notes |
| --- | --- | --- |
| `value` | `string` | Required. The selected option's value. Controlled; a value matching no option leaves all radios unchecked |
| `options` | `{label: string, value: string, disabled?: boolean}[]` | Required. Choices in display order |
| `onValueChange` | `(value: string, event) => void` | Called with the chosen option's value |
| `label` | `string` | Visible `<legend>`. A blank label is ignored |
| `aria-label`, `aria-labelledby` | `string` | The types require `label`, `aria-label` or `aria-labelledby` |
| `name` | `string` | Shared radio `name`. Defaults to a generated id, so groups never collide |
| `disabled` | `boolean` | Native `<fieldset disabled>`: disables every radio. Per-option `disabled` disables one |
| `className`, `style`, `id`, `ref`, other attributes | as `<fieldset>` | All go to the root `<fieldset>` |

```tsx
<RadioGroup label="Plan" value={plan} onValueChange={setPlan} options={[{label: "Free", value: "free"}, {label: "Pro", value: "pro"}]} />
```

The selected radio shows an accent-colored dot (`--ui-accent-solid`). Hover (enabled), `:focus-visible` (2px outline) and `:disabled` states use semantic tokens, so light and dark themes need no extra rules. Options are stacked vertically.

## OpenUI API

```text
RadioGroup(value, options, label?, disabled?)
```

| Argument | Notes |
| --- | --- |
| `value` | A bare string `$variable`, declared with a default equal to one option's value |
| `options` | Array of strings (label and value are the same text) or `{label, value}` objects. The two forms can be mixed |
| `label` | Group label (legend). Without it the accessible name is just "Radio group", so always set one |
| `disabled` | boolean |

```text
$size = "m"
root = Stack([group, choice])
group = RadioGroup($size, [{label: "Small", value: "s"}, {label: "Medium", value: "m"}, {label: "Large", value: "l"}], "T-shirt size")
choice = Text("Size code: " + $size)
```

Strings are the simplest form for an assistant to generate; the object form is only needed when the stored value should differ from the shown text. Both are verified by the generated examples and appear in the generated signature as `(string | {label: string, value: string})[]`.

`value` is wrapped in `reactive()` and read with `useStateField()`; every expression that reads the variable updates immediately, and `@Reset($size)` restores the declared default. Only a bare `$variable` is writable. An expression or literal renders a **disabled** group showing that value. Each group uses its own generated `name` and keys the SDK's fallback field with its own `useId()`, so groups never share state or arrow-key navigation. The group is also disabled while the document is streaming.

## Limitations

No per-option `disabled` or descriptions in OpenUI (the React API has per-option `disabled`), no horizontal layout, no RadioItem component, no card-style options.
