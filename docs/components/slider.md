# Slider

Classification: `level: "primitive"`, `family: "controls"`.

```text
visual/components/Slider/
  Slider.tsx          React component and public props
  Slider.css          Track, fill, thumb and state styling (imported from app/layout.tsx)
  Slider.openui.tsx   OpenUI schema and two-way binding adapter
  Slider.examples.ts  OpenUI examples, spread into `examples` in registry.ts
```

`Slider.tsx` renders a native `<input type="range">` and imports nothing from OpenUI, the board or MCP. Pointer dragging and the arrow, Home, End and Page keys are native behavior; the value updates on every `input` event, so it changes live while dragging.

## React API

| Prop | Type | Notes |
| --- | --- | --- |
| `value` | `number` | Required. The slider is controlled |
| `onValueChange` | `(value: number, event) => void` | Called with the new number on every change |
| `min`, `max`, `step` | `number` | Default `0`, `100` and `1` |
| `label` | `string` | Visible `<label>` linked with `htmlFor`. A blank label is ignored |
| `aria-label`, `aria-labelledby` | `string` | The types require `label`, `aria-label` or `aria-labelledby` |
| `className`, `style` | as `<div>` | Both apply to the wrapper (root element) |
| `disabled`, `name`, `id`, `ref`, other native attributes | as `<input>` | `type` and `onChange` are managed by the component |

```tsx
<Slider label="Volume" value={volume} onValueChange={setVolume} min={0} max={100} step={5} />
```

The current value is shown to the right of the label (`aria-hidden`: the range input already announces its value). The filled part of the track is drawn from a `--vl-slider-fraction` CSS variable that the component sets inline, with separate WebKit and Firefox rules. Hover is not styled; `:focus-visible` shows a ring around the thumb, `:disabled` dims the control. Tokens are semantic, so light and dark themes need no extra rules.

## OpenUI API

```text
Slider(value, label?, min?, max?, step?, disabled?)
```

| Argument | Notes |
| --- | --- |
| `value` | A bare number `$variable`, declared with a default. Dragging writes a single number |
| `label` | Visible label. Without it the accessible name is just "Slider", so always set one |
| `min`, `max`, `step` | Default `0`, `100`, `1`. A non-positive `step` is ignored |
| `disabled` | boolean |

```text
$volume = 40
root = Stack([slider, readout])
slider = Slider($volume, "Volume", 0, 100, 5)
readout = Text("Volume is " + $volume + "%", "muted")
```

`value` is wrapped in `reactive()` and read with `useStateField()`; every expression that reads the variable updates immediately, and `@Reset($volume)` restores the declared default. Only a bare `$variable` is writable. An expression or literal renders a **disabled** slider showing that value. Each instance keys the SDK's fallback field with its own `useId()`, so instances never share state. The slider is also disabled while the document is streaming. `label` sits second, as in `Checkbox`.

## Limitations

Single value only (no range with two thumbs, no array binding). The variable keeps the declared default even if the browser shows it snapped to the nearest valid step or clamped to `min`/`max`, until the user moves the slider. No tick marks, vertical orientation, or custom value formatting.
