# Divider

A thin line that separates sections of content. Classification: `level: "foundation"`, `family: "layout"`.

```text
visual/components/Divider/
  Divider.tsx            React component
  Divider.css            Line, orientation, tone and spacing (imported from app/layout.tsx)
  Divider.openui.tsx     OpenUI schema: Divider(orientation?, tone?, spacing?, decorative?)
  Divider.examples.ts    OpenUI examples, spread into `examples` in registry.ts
```

`Divider.tsx` imports nothing from OpenUI, the board, MCP or Next.js. Like the other components, `Divider.css` is imported from `app/layout.tsx` because `scripts/gen-library.tsx` runs under `tsx`, which cannot import `.css`.

## Divider, Stack, Card and Text

| Use | When |
| --- | --- |
| **Divider** | A visible line between sections of content |
| **Stack** `gap` | Plain space between items, with no line |
| **Card** | Visual grouping on a surface |
| **Text** | Headings and labels; Divider has no label, icon or text of its own |

## React API

```tsx
<Divider />
<Divider orientation="vertical" />
<Divider tone="subtle" spacing="md" />
<Divider decorative={false} />
```

| Prop | Type | Default |
| --- | --- | --- |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |
| `tone` | `"subtle" \| "default" \| "strong"` | `"subtle"` |
| `spacing` | `"none" \| "xs" \| "sm" \| "md" \| "lg"` | `"sm"` |
| `decorative` | `boolean` | `true` |

`className` and other `div` attributes are passed to the element, and `ref` (React 19 ref-as-prop) points at it. Divider takes no children, has no state and no events.

## OpenUI API

```text
Divider(orientation?, tone?, spacing?, decorative?)
```

All arguments are optional; skip one you do not need with `null`. Enums are constrained by the Zod schema.

```text
root = Stack([intro, Divider(), details, Divider("horizontal", "strong", "md")])
row = Stack([Text("Draft"), Divider("vertical", "default"), Text("3 comments")], "none", "horizontal", "stretch")
```

Divider is accepted as a child of `Stack` and `Card`.

## Behavior

- **Horizontal** dividers fill the available width and are 1 px tall.
- **Vertical** dividers are 1 px wide and stretch to the height of a flex or grid parent, so put them in a horizontal Stack with `align` left at `stretch` (the default) or set explicitly. A `min-height` of one spacing step keeps them visible when the parent has no height of its own. They do not fill a plain block parent; use a horizontal Stack.
- **Spacing** is margin around the line (above and below, or left and right for vertical), never thickness. The line is always 1 px. Margin adds to a parent's `gap`, so use `spacing="none"` inside a Stack whose gap already separates the items.
- **Tone** uses theme tokens only: `subtle` is `--ui-border`, `strong` is `--ui-text-muted`, and `default` sits between them, so light and dark themes need no extra rules.

## Accessibility

| `decorative` | Markup |
| --- | --- |
| `true` (default) | `aria-hidden="true"`; assistive technology skips it |
| `false` | `role="separator"` and `aria-orientation` set to the orientation |

Use `decorative={false}` only when the line marks a real boundary between two regions; most dividers are decorative.

## Limitations

No labels, icons, text, dashed or dotted styles, custom thickness or colour, and no interaction.
