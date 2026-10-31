# Skeleton

Classification: `level: "composite"`, `family: "feedback"`.

```text
visual/components/Skeleton/
  Skeleton.tsx            React component and public props
  Skeleton.css            Placeholder surfaces and the reduced-motion-aware pulse
  Skeleton.openui.tsx     OpenUI schema (shape and size only)
  Skeleton.examples.ts    OpenUI examples, spread into `examples` in registry.ts
```

`Skeleton.tsx` imports nothing from OpenUI, the board or MCP. It is presentational: no state, no children, no template language. Compose several in a [Stack](stack.md), [Grid](grid.md) or [Card](card.md) to sketch a layout. Use [Spinner](spinner.md) for a wait with no known layout and [Progress](progress.md) when the amount done is known.

## React API

| Prop | Type | Notes |
| --- | --- | --- |
| `variant` | `text \| rectangle \| circle` | Default `text` |
| `width` | `string \| number` | A number is pixels; a string is any CSS length (`"60%"`). Default full width; 40px for a circle |
| `height` | `string \| number` | Same units. For `text` it is the height of **each line** (default 14px); a rectangle defaults to 96px; a circle uses the width |
| `lines` | `number` | `text` only. Clamped to 1–20. The last of several lines is 65% wide |
| `animated` | `boolean` | A subtle pulse. Default `true` |
| `className`, `style`, `ref`, other `<div>` attributes | | Applied to the root |

```tsx
<Skeleton variant="circle" width={48} />
<Skeleton lines={3} />
<Skeleton variant="rectangle" width="100%" height={160} />
```

A fixed width never overflows a narrower container (`max-width: 100%`).

## Accessibility and motion

- The root is `aria-hidden="true"` and contains no text, so screen readers skip it and it can never be mistaken for real data. Nothing in it is focusable.
- It says nothing about *loading*. The container that is loading should: put `aria-busy="true"` on it, and/or show a visible (or `role="status"`) "Loading…" message. A page of skeletons with no such message is silent to assistive technology.
- The pulse is declared only inside `@media (prefers-reduced-motion: no-preference)`, so it is off for users who ask for less motion, and `animated={false}` turns it off for everyone.
- The fill is the text colour mixed into the surface (`color-mix`), so it is subtle on a card and the canvas in both themes without per-theme rules.

## OpenUI API

```text
Skeleton(variant?, width?, height?, lines?, animated?)
```

`width` and `height` are a number (pixels) or a CSS length string such as `"60%"` or `"12rem"`; anything else is dropped before it reaches a style attribute. It has no reactive state and does not switch to real content by itself: show the Skeleton or the content depending on the data you have.

```text
root = Card("Loading profile", null, [loading, header, bio])
loading = Text("Loading…", "muted", "caption")
header = Stack([avatar, name], "md", "horizontal", "center")
avatar = Skeleton("circle", 48)
name = Stack([line1, line2], "xs")
line1 = Skeleton("text", "160px")
line2 = Skeleton("text", "100px")
bio = Skeleton("text", null, null, 3)
```
