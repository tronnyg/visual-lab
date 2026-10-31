# Progress

Classification: `level: "primitive"`, `family: "feedback"`.

```text
visual/components/Progress/
  Progress.tsx          React component and public props
  Progress.css          Track and fill styling (imported from app/layout.tsx)
  Progress.openui.tsx   OpenUI schema: Progress(value, max?, label?)
  Progress.examples.ts  OpenUI examples, spread into `examples` in registry.ts
```

`Progress.tsx` renders a native `<progress>` and imports nothing from OpenUI, the board or MCP. The browser supplies the `progressbar` role and the value, minimum and maximum, so no ARIA attributes are added by hand. Progress is display-only and determinate: no indeterminate state, animation, disabled state or reactive binding.

## React API

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `number` | required |
| `max` | `number` | `100` |
| `label` | `string` | none |

```tsx
<Progress value={40} label="Upload progress" />
<Progress value={3} max={5} label="Setup steps" />
```

`label` becomes the accessible name (`aria-label`); it is not displayed. `aria-labelledby` and other `progress` attributes are passed to the element, and `ref` (React 19 ref-as-prop) points at it. Pair the bar with visible text yourself when you want the percentage on screen.

## Clamping

Invalid input is made safe before it reaches the element:

| Input | Result |
| --- | --- |
| `value` below 0 | 0 |
| `value` above `max` | `max` (a full bar) |
| `value` not a finite number | 0 |
| `max` missing, 0, negative or not finite | 100 |

## Styling

An 8px bar, rounded with `--ui-radius-full`. The fill is `--ui-accent-solid` and the track is a 20% tint of the same colour over `--ui-surface`, so light and dark themes need no extra rules. The bar fills the width of its parent. WebKit/Blink and Firefox style the fill through different pseudo-elements (`::-webkit-progress-value`, `::-moz-progress-bar`), which are kept in separate rules in `Progress.css`. There is no transition, so the fill jumps to a new value.

## OpenUI API

```text
Progress(value, max?, label?)
```

| Argument | Notes |
| --- | --- |
| `value` | A number or expression, e.g. a `$variable`. The bar follows it whenever it changes. Progress never writes to it |
| `max` | Value at which the bar is full. Default 100 |
| `label` | Accessible name, not displayed. When omitted the adapter uses "Progress" |

```text
$done = 40
root = Stack([text, bar, pick])
text = Text("Upload: " + $done + "%")
bar = Progress($done, 100, "Upload progress")
pick = Slider($done, "Set progress", 0, 100)
```

Progress draws no text, so add a [Text](text.md) next to it for a visible label or percentage. Progress is accepted as a child of `Stack`, `Card` and `Grid`.

## Limitations

No indeterminate mode (use a Spinner for unknown durations), animation, colour variants, sizes, built-in percentage text or buffer segments. Use [Slider](slider.md) when the user should set the value.
