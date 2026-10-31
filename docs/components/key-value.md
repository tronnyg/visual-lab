# KeyValue

Classification: `level: "composite"`, `family: "data-display"`.

```text
visual/components/KeyValue/
  KeyValue.tsx          React component and public props
  KeyValue.css          Layouts, dividers and the narrow-container rule (imported through styles/components.css)
  KeyValue.openui.tsx   OpenUI schema: KeyValue(items, layout?, dividers?, emptyMessage?)
  KeyValue.examples.ts  OpenUI examples, spread into `examples` in registry.ts
  KeyValue.stories.tsx  Storybook stories
```

`KeyValue.tsx` renders a native description list (`dl`, with a `dt` label and a `dd` value for each pair, grouped in a `div`) and imports nothing from OpenUI, the board or MCP. It is read-only display: no editing and no property-inspector behavior.

## React API

| Prop | Type | Default |
| --- | --- | --- |
| `items` | `{label: string; value: ReactNode}[]` | required |
| `layout` | `"inline" \| "stacked"` | `"inline"` |
| `dividers` | `boolean` | `false` |
| `emptyMessage` | `string` | `"No details"` |

```tsx
<KeyValue
  items={[{label: "Status", value: "Active"}, {label: "Owner", value: "Alex"}, {label: "Updated", value: "Today"}]}
  layout="inline"
  dividers
/>
```

`className`, `style` and other `div` attributes go to the outer element, and `ref` (React 19 ref-as-prop) points at it.

## Behavior

- **Layouts.** `inline` puts each label in a column (6 to 10 rem) beside its value. `stacked` puts the label above the value.
- **Responsive.** The root is a size container: when it is narrower than 24 rem, inline pairs stack. This follows the available space (a card, a grid cell), not the viewport.
- **Dividers.** A `--ui-border` line between pairs, never above the first or below the last.
- **Long content.** Labels and values wrap, even unbroken strings, and never widen the component.
- **Blank values.** `null`, `undefined`, `false` and an empty string render a dash for sighted users and "No value" for screen readers. `0` is a value and is shown.
- **Empty.** With no items a muted `emptyMessage` paragraph is shown instead of an empty list.
- **Styling.** Labels are `--ui-text-muted`, values `--ui-text`. Only `--ui-*` tokens are used, so light and dark themes need no extra rules.

## OpenUI API

```text
KeyValue(items, layout?, dividers?, emptyMessage?)
```

| Argument | Notes |
| --- | --- |
| `items` | Array of `{label, value}` objects; `value` is text, a number, or `null` for no value |
| `layout` | `inline` (default) or `stacked` |
| `dividers` | `true` draws lines between pairs |
| `emptyMessage` | Text for an empty `items` array |

```text
root = KeyValue([{label: "Status", value: "Active"}, {label: "Owner", value: "Alex"}, {label: "Open issues", value: 12}], "inline", true)
```

Values may be expressions such as `$count`, which update live. OpenUI values are text or numbers only: rich values (badges, links, other components) are a React-only capability, so the adapter has no child references. KeyValue is accepted as a child of `Stack`, `Card` and `Grid`.

## Limitations

No editing, copy buttons, grouping or sections, multiple values per label, or rich values in OpenUI. Use [Table](table.md) for many records with shared columns.
