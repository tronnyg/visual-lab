# Spinner

Classification: `level: "primitive"`, `family: "feedback"`.

```text
visual/components/Spinner/
  Spinner.tsx          React component and public props
  Spinner.css          Ring, sizes, rotation and reduced-motion styling (imported from app/layout.tsx)
  Spinner.openui.tsx   OpenUI schema: Spinner(size?, label?)
  Spinner.examples.ts  OpenUI examples, spread into `examples` in registry.ts
```

`Spinner.tsx` renders a `<span>` and imports nothing from OpenUI, the board or MCP. The spinner is plain CSS (a bordered ring with one coloured arc and a `rotate` animation): no animation library, timers or fake async behavior. It is purely presentational. It does not know whether anything is loading and never stops itself; the page decides whether to show it.

## React API

| Prop | Type | Default |
| --- | --- | --- |
| `size` | `"sm" \| "md" \| "lg"` (16, 24, 32 px) | `"md"` |
| `label` | `string` | none |

```tsx
<Spinner />
<Spinner size="lg" label="Loading results" />
```

`className` and other `span` attributes are passed to the element, and `ref` (React 19 ref-as-prop) points at it.

## Accessibility

| With | Result |
| --- | --- |
| `label` | The spinner gets `role="status"` and a visually hidden text node with the label, so a screen reader can announce it. The label is never drawn |
| no `label` | The spinner is decorative and `aria-hidden`, so it adds no announcement |

Set a label when the spinner is the only sign that something is loading. Leave it out beside visible text such as "Saving…", so the message is not read twice.

### Reduced motion

Under `prefers-reduced-motion: reduce` the ring stops rotating and fades in and out slowly instead (opacity only, about 0.6 Hz), so it still reads as busy without any spinning motion.

## Styling

The ring is a `2px` border (`3px` for `lg`) whose track is a 20% tint of `--ui-accent-solid` over `--ui-surface` and whose arc is `--ui-accent-solid`, so light and dark themes need no extra rules. This matches [Progress](progress.md). Width and height are fixed from `size`, so showing or hiding a spinner in a box of the same size does not shift the layout around it. The shape is a true circle (`border-radius: 50%`), not a themeable `--ui-radius-*` corner.

## OpenUI API

```text
Spinner(size?, label?)
```

| Argument | Notes |
| --- | --- |
| `size` | `sm`, `md` (default) or `lg`. Skip it with `null` to give only a label |
| `label` | Accessible loading message, not displayed |

```text
root = Stack([spin, text], "sm", "horizontal", "center")
spin = Spinner("sm")
text = Text("Saving your changes…", "muted")
```

Spinner is accepted as a child of `Stack`, `Card` and `Grid`.

## Limitations

No variants, colours, speed, stroke width, determinate mode, overlay, or loading state. Use [Progress](progress.md) when the amount done is known.

When the shape of the loading content is known, [Skeleton](skeleton.md) is the placeholder to use; Spinner is for a wait with no known layout.
