# Spacer

Intentional empty space inside a layout. Classification: `level: "foundation"`, `family: "layout"`.

```text
visual/components/Spacer/
  Spacer.tsx            React component
  Spacer.css            Fixed sizes and grow (imported from app/layout.tsx)
  Spacer.openui.tsx     OpenUI schema: Spacer(size?)
  Spacer.examples.ts    OpenUI examples, spread into `examples` in registry.ts
```

`Spacer.tsx` imports nothing from OpenUI, the board, MCP or Next.js. Like the other components, `Spacer.css` is imported from `app/layout.tsx` because `scripts/gen-library.tsx` runs under `tsx`, which cannot import `.css`.

## When to use Spacer

Stack already provides `gap`, `padding` and `justify`. Use Spacer only where they cannot express the layout cleanly:

| Need | Use |
| --- | --- |
| Ordinary, uniform spacing between all items | Stack `gap` |
| Distribute a whole row or column (`between`, `around`, `evenly`) | Stack `justify` |
| Push selected siblings apart, such as a title on the left and actions on the right | `Spacer("grow")` |
| One intentionally larger space at a single point | `Spacer("lg")` or `Spacer("xl")` |

Do not fill a board with Spacers for ordinary spacing.

## React API

```tsx
<Spacer />
<Spacer size="lg" />
<Spacer size="grow" />
```

| Prop | Type | Default |
| --- | --- | --- |
| `size` | `"xs" \| "sm" \| "md" \| "lg" \| "xl" \| "grow"` | `"md"` |

`className` and other `div` attributes are passed to the element, and `ref` (React 19 ref-as-prop) points at it. Spacer takes no children, has no state and no events.

## OpenUI API

```text
Spacer(size?)
```

`size` is optional; skip it with `null`. Spacer is accepted as a child of `Stack` and `Card`, not `Grid`.

```text
root = Stack([title, Spacer("grow"), Icon("bell"), Button("New")], "sm", "horizontal", "center", "start", false, "none", "full")
```

## Behavior

- **Fixed sizes** are `xs` 4 px, `sm` 8 px, `md` 16 px, `lg` 24 px and `xl` 48 px (twice `lg`). They are applied as `flex-basis`, which is the main-axis size, so the space follows the parent's direction: vertical in a vertical Stack or Card, horizontal in a horizontal Stack. The cross-axis size is zero, so nothing is drawn.
- **`grow`** (`flex: 1 1 0%`) takes whatever main-axis room is left and shares it equally between several growing Spacers. It needs spare room: a horizontal Stack with `width` set to `full` (or inside a growing parent). In a vertical Stack or Card with automatic height there is no spare room, so it collapses to nothing.
- **Spacer adds to the gap.** The parent's `gap` still applies on both sides of the Spacer. With `gap="sm"` (8 px) a `lg` Spacer (24 px) gives 8 + 24 + 8 = 40 px. Pair Spacer with a small or `none` gap when you want an exact size.
- Outside a flex parent a Spacer has no size.

## Accessibility

An empty `div` with `aria-hidden="true"`. It is not focusable and has no interaction.

## Styling

`Spacer.css` uses only `--ui-space-*` tokens. State is driven by the `data-size` attribute. There are no Tailwind classes or inline styles.

## Limitations

No custom pixel sizes, children, background, border or line (use Divider for a visible separator), and no effect in Grid.
