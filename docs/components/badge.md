# Badge

Classification: `level: "primitive"`, `family: "feedback"`.

```text
visual/components/Badge/
  Badge.tsx          React component and public props
  Badge.css          Pill shape and variant colours (imported from app/layout.tsx)
  Badge.openui.tsx   OpenUI schema: Badge(text, variant?)
  Badge.examples.ts  OpenUI examples, spread into `examples` in registry.ts
```

`Badge.tsx` renders a `<span>` and imports nothing from OpenUI, the board or MCP. Badge is display-only: it has no click, focus or button behavior, and no reactive binding.

## React API

| Prop | Type | Default |
| --- | --- | --- |
| `variant` | `"default" \| "secondary" \| "outline" \| "success" \| "warning" \| "danger"` | `"default"` |

```tsx
<Badge>New</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="outline">v2.4</Badge>
```

Content is `children`. `className`, `style` and other `span` attributes are passed to the element, and `ref` (React 19 ref-as-prop) points at it.

## Variants

| Variant | Look |
| --- | --- |
| `default` | Solid `--ui-accent-solid` with `--ui-on-accent` text |
| `secondary` | `--ui-surface-muted` with `--ui-text` |
| `outline` | Transparent with a `--ui-border` border |
| `success`, `warning`, `danger` | 12% tint of `--ui-success`, `--ui-warning` or `--ui-danger` over `--ui-surface`, with text mixed toward `--ui-text` for contrast |

All colours are `--ui-*` tokens, so the light and dark themes need no extra rules. The badge is a 12px, 500-weight pill (corners from `--ui-radius-full`, so a theme can change its roundness) that sits inline, never wraps (`white-space: nowrap`), and truncates with an ellipsis when its container is narrower than the label. Colour is never the only signal: put the meaning in the text ("Overdue", not just a red dot).

## OpenUI API

```text
Badge(text, variant?)
```

| Argument | Notes |
| --- | --- |
| `text` | Short label (string or number). May be an expression, e.g. `$count + " open"`; it updates when the variable changes |
| `variant` | One of the six variants above. Default `default` |

```text
$count = 3
root = Stack([status, pick])
status = Badge($count + " open", $count > 0 ? "warning" : "success")
pick = Slider($count, "Open items", 0, 10)
```

Badge is accepted as a child of `Stack`, `Card` and `Grid`.

## Limitations

No icons, dismiss button, link or click behavior, sizes, or custom colours. Use [Button](button.md) for actions and [Text](text.md) for sentences.
