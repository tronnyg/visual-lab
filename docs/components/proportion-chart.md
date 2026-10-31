# ProportionChart

Classification: `level: "specialized"`, `family: "visualization"`.

```text
visual/components/ProportionChart/
  ProportionChart.tsx           React component and public props
  proportionModel.ts            Data validation and share calculation (no React)
  ProportionChart.css           Pie/donut-specific rules (imported through styles/components.css)
  ProportionChart.openui.tsx    OpenUI schema: ProportionChart(type, data, nameKey, valueKey, ...)
  ProportionChart.examples.ts   OpenUI examples, spread into `examples` in registry.ts
  ProportionChart.stories.tsx   Storybook stories
```

It draws with [Recharts](https://recharts.github.io) 3 and uses the same shared layer as [Chart](chart.md) (`visual/charts/`: figure, legend, tooltip, hidden data table, formatting, palette). It imports nothing from OpenUI, the board, MCP or Next.js.

## React API

| Prop | Type | Default |
| --- | --- | --- |
| `type` | `"pie" \| "donut"` | `"pie"` |
| `data` | `Record<string, string \| number \| null>[]` | required |
| `nameKey` | `string` | required |
| `valueKey` | `string` | required |
| `title` | `string` | none |
| `description` | `string` | none |
| `height` | `number` (px) | `300` |
| `showLegend` | `boolean` | `true` |
| `showTooltip` | `boolean` | `true` |
| `showLabels` | `boolean` | `false` |
| `valueFormat` | `{style?: "number" \| "currency" \| "percent"; currency?: string; maximumFractionDigits?: number}` | plain numbers |

```tsx
<ProportionChart
  type="donut"
  data={[{category: "Desktop", value: 55}, {category: "Mobile", value: 35}, {category: "Tablet", value: 10}]}
  nameKey="category"
  valueKey="value"
  title="Traffic by device"
/>
```

`className`, `style` and other `figure` attributes go to the outer element, and `ref` points at it.

## When to use it

Use a pie or donut only for a few (about 2 to 6) categories that are meaningful parts of one whole. For many categories or precise comparisons use [Chart](chart.md) with `type="bar"`; use [Table](table.md) for exact values. The palette has six colours and repeats after the sixth, so many slices are not distinguishable by colour alone.

## Data semantics

- **Values are amounts, never percentages.** The share of each category is its value divided by the total of all values, so `[30, 10]` gives 75% and 25%. A value of `0.25` is a quarter of the total only if the total is 1.
- **Zero values** have no slice and no legend entry, but remain in the data table with a 0% share.
- **All zeros** show an empty state ("Every value is zero…"). **No rows** also shows an empty state.
- **Invalid data** shows an error (`role="alert"`) listing up to three problems: a negative value, a missing (`null`) value, a text or non-finite value (`"40"`, `NaN`, `Infinity`), a missing or blank name, a repeated name, or a missing key. Nothing is repaired or coerced.
- A **single category** is a full circle or ring at 100%.

## Display

- **Pie** fills the circle; **donut** leaves a ring with an empty centre (no total or label inside in v1).
- **Legend** lists each drawn category with its share. It is decorative (`aria-hidden`): the names and shares are in the data table.
- **Labels** (`showLabels`) put each slice's share outside the slice with a leader line. Slices under 4% are not labelled, because the label would collide with its neighbours; they stay in the legend, tooltip and table. When the legend is hidden, a label also carries the category name.
- **Tooltip** shows the category, its raw value (formatted with `valueFormat`) and its calculated share. Hovering a slice or moving with the arrow keys shows it, and it never captures the pointer.
- **Formatting.** `valueFormat` applies to raw values only. Shares are always percentages with up to one decimal (`54.5%`). A format of `percent` on raw values such as `0.2` and `0.6` shows `20%` and `60%` as values and `25%` and `75%` as shares.
- No 3D, exploded slices or animation.

## Accessibility

Same model as Chart: a `figure` named by the title (or "Pie chart of value by category"), an accessible description, a visually hidden `table` (caption "Data for …", headers `<nameKey>`, `<valueKey>` and "Share of total", one row per category including zero-value ones), and one focusable SVG named like the figure whose arrow keys show the tooltip. Colour is not the only channel: the legend and table carry names and shares, and `showLabels` puts shares on the chart.

## OpenUI API

```text
ProportionChart(type, data, nameKey, valueKey, title?, description?, valueFormat?, showLegend?, showLabels?, height?)
```

```text
root = ProportionChart("donut", data, "category", "value", "Traffic by device")
data = [{category: "Desktop", value: 55}, {category: "Mobile", value: 35}, {category: "Tablet", value: 10}]
```

`type` is required in OpenUI (React defaults to `pie`). `showTooltip` is React-only. ProportionChart is accepted as a child of `Stack`, `Card` and `Grid`, and has no writable state or bindings.

## Limitations

No center label, sorting, grouping of small slices into "Other", drill-down, selection or animation.
