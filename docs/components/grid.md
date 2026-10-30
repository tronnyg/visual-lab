# Grid

Two-dimensional layout in equal columns. Classification: `level: "foundation"`, `family: "layout"`.

```text
visual/components/Grid/
  Grid.tsx            React component
  Grid.css            Columns, gaps, alignment, width (imported from app/layout.tsx)
  Grid.openui.tsx     OpenUI schema: Grid(children, columns?, ...)
  Grid.examples.ts    OpenUI examples, spread into `examples` in registry.ts
```

`Grid.tsx` imports nothing from OpenUI, the board, MCP or Next.js. Like the other components, `Grid.css` is imported from `app/layout.tsx` because `scripts/gen-library.tsx` runs under `tsx`, which cannot import `.css`.

Grid is an invisible layout component: no background, border, radius or shadow.

## Grid, Stack and Card

| Use | When |
| --- | --- |
| **Grid** | Columns and rows with predictable alignment: galleries, dashboards, label/value pairs |
| **Stack** | A single column or row (Flexbox) |
| **Card** | Visual grouping on a surface; place Cards inside a Grid |

## React API

```tsx
<Grid columns={3} gap="md">
  <Card>First</Card>
  <Card>Second</Card>
  <Card>Third</Card>
</Grid>
```

| Prop | Type | Default |
| --- | --- | --- |
| `columns` | `1 \| 2 \| 3 \| 4` | `2` |
| `gap` | `"none" \| "xs" \| "sm" \| "md" \| "lg"` | `"md"` |
| `rowGap` | same as `gap`; overrides `gap` for rows | `gap` |
| `columnGap` | same as `gap`; overrides `gap` for columns | `gap` |
| `align` | `"start" \| "center" \| "end" \| "stretch"` (items, vertical) | `"stretch"` |
| `justify` | `"start" \| "center" \| "end" \| "stretch"` (items, horizontal) | `"stretch"` |
| `minColumnWidth` | `"none" \| "sm" \| "md" \| "lg"` | `"sm"` |
| `width` | `"auto" \| "full" \| "sm" \| "md" \| "lg"` | `"auto"` |

`className` and other `div` attributes are passed to the element, and `ref` (React 19 ref-as-prop) points at it. There are no arbitrary CSS grid expressions.

## OpenUI API

```text
Grid(children, columns?, gap?, rowGap?, columnGap?, align?, justify?, minColumnWidth?, width?)
```

`children` is required; skip any optional argument with `null`. Children are typed references to `Grid`, `Stack`, `Card`, `Text`, `Markdown`, `Image`, `Divider`, `Icon` and `Button`, so Grids nest and mix with other components. Grid is accepted as a child of `Stack` and `Card`. Children are rendered by the standard renderer; there is no custom child mechanism.

```text
root = Stack([title, grid])
title = Text("Dashboard", "default", "heading", "h2")
grid = Grid([Card("One"), Card("Two"), Card("Three")], 3, "md")
```

## Responsive behaviour

There is no breakpoint system. Every column has a minimum width (`minColumnWidth`: `sm` 10 rem, `md` 14 rem, `lg` 20 rem), and `columns` is the most columns the grid will use:

```css
grid-template-columns: repeat(auto-fill, minmax(min(100%, max(var(--vl-grid-min), (100% - gaps) / columns)), 1fr));
```

In a wide container the grid has exactly `columns` equal columns. In a narrower one it uses as many columns as fit at the minimum width, down to one, so it never overflows a narrow board container. This follows the width of the Grid's own container, not the viewport, so it works inside a narrow Stack or Card. `minColumnWidth="none"` always keeps `columns` equal columns (`minmax(0, 1fr)`), which suits short content such as stats.

Empty columns are kept (`auto-fill`), so one item in a four-column grid stays a quarter wide. Items have `min-width: 0` and shrink below their content instead of overflowing.

## Width

A Grid fills its parent's width in ordinary block layouts. `full` forces it in layouts that otherwise shrink to fit, such as a horizontal Stack; `sm`, `md` and `lg` fill the parent up to 480, 640 or 800 px, the same as Stack.

## Styling

`Grid.css` uses only `--ui-space-*` tokens. State is driven by `data-columns`, `data-gap`, `data-row-gap`, `data-column-gap`, `data-align`, `data-justify`, `data-min` and `data-width` attributes. There are no Tailwind classes or inline styles.

## Limitations

No spanning items, explicit row heights, named areas, per-item placement, padding or arbitrary column sizes. Use nested Grids and Stacks for more complex layouts.
