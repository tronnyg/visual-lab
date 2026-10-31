# Chart

Classification: `level: "specialized"`, `family: "visualization"`.

```text
visual/components/Chart/
  Chart.tsx            React component and public props
  chartModel.ts        Data validation and the plot-ready model (no React)
  Chart.css            Cartesian-specific rules (imported through styles/components.css)
  Chart.openui.tsx     OpenUI schema: Chart(type, data, xKey, series, ...)
  Chart.examples.ts    OpenUI examples, spread into `examples` in registry.ts
  Chart.stories.tsx    Storybook stories
visual/charts/         Small layer shared by the chart components
  ChartFrame.tsx       Figure, title, description, legend, empty/invalid state
  ChartTooltip.tsx     Tooltip body
  chartAccessibility.tsx  The hidden data table
  chartColors.ts       Series colour tokens
  chartFormatting.ts   ValueFormat and number formatting
  charts.css           Shared styles
```

`Chart.tsx` draws with [Recharts](https://recharts.github.io) 3 and imports nothing from OpenUI, the board, MCP or Next.js. Recharts types and props are not part of the public API.

## React API

| Prop | Type | Default |
| --- | --- | --- |
| `type` | `"bar" \| "line" \| "area" \| "scatter"` | required |
| `data` | `Record<string, string \| number \| null>[]` | required |
| `xKey` | `string` | required |
| `series` | `{dataKey: string; label?: string}[]` | required, at least one |
| `title` | `string` | none |
| `description` | `string` | none |
| `height` | `number` (px) | `300` |
| `xAxisLabel`, `yAxisLabel` | `string` | none |
| `showLegend` | `boolean` | `true` when there is more than one series |
| `showTooltip` | `boolean` | `true` |
| `showGrid` | `boolean` | `true` |
| `showPoints` | `boolean` (Line and Area) | `false` |
| `horizontal` | `boolean` (Bar) | `false` |
| `valueFormat` | `{style?: "number" \| "currency" \| "percent"; currency?: string; maximumFractionDigits?: number}` | plain numbers |

```tsx
<Chart
  type="line"
  data={[{month: "Jan", sales: 120, expenses: 80}, {month: "Feb", sales: 160, expenses: 95}]}
  xKey="month"
  series={[{dataKey: "sales", label: "Sales"}, {dataKey: "expenses", label: "Expenses"}]}
  title="Monthly performance"
/>
```

The width always fills the container. `className`, `style` and other `figure` attributes go to the outer element, and `ref` points at it.

## Chart types

| Type | Use it to | Behavior |
| --- | --- | --- |
| `bar` | compare categories | Vertical by default, `horizontal` for long names. Several series are grouped, never stacked. Bars below zero point down. |
| `line` | show a trend | Straight segments. `showPoints` marks every point; a point with no neighbours is always marked. |
| `area` | emphasize magnitude along an ordered axis | Like Line with a subtle fill down to zero. Not stacked. |
| `scatter` | relate two numeric variables | Points only, no lines. Each series has its own marker shape as well as its own colour. |

Use [Table](table.md) when precise values matter more than the shape.

## Data semantics

- **X axis.** Bar always treats X as categories: a numeric identifier such as `2020` keeps its label and is not a position. Line and Area use a categorical axis when every X is text and a numeric axis (spacing proportional to the value, drawn in ascending order) when every X is a finite number; a mix is invalid. Scatter needs a finite number for every X, so text is invalid rather than silently becoming categories.
- **Missing values.** A `null` Y, or a field missing from one row, is a gap in Line and Area, no bar in Bar and no point in Scatter. It is never plotted as 0, and the data table says "No value".
- **Duplicates.** Repeated X values are valid on a numeric axis and in Scatter. On a categorical axis they would draw two rows on top of each other, so they are invalid.
- **Zero baseline.** Bar and Area value axes always include 0. Line and Scatter fit the data.
- **Series keys.** Series are read through internal keys, so a `dataKey` such as `"net.sales"` is a plain field name, not a nested path.

## Empty and invalid data

The chart never repairs data in a way that changes its meaning. Instead of a drawing it shows a message inside the figure:

- **Empty** (`role="status"`): no rows, or no value to plot in any series.
- **Invalid** (`role="alert"`): no series, duplicate series, a missing or non-finite X, a Y that is not a finite number (text such as `"12"`, `NaN`, `Infinity`), a series that appears in no row, mixed X types on Line or Area, text X on Scatter, repeated categories. Up to three specific problems are listed.

## Accessibility

- The component is a `figure` named by the visible title, or by a generated name such as "Line chart of Sales and Expenses by Month". `description` becomes its accessible description.
- Every chart contains a real `table` (caption "Data for …", column headers, row headers) holding the source rows in their original order, with the same formatting as the tooltips. A missing value is the text "No value". It is hidden with a standard visually-hidden technique, never `display: none`, `visibility: hidden` or `aria-hidden`.
- The drawn SVG is one focusable `application` named like the figure ("interactive chart"). Arrow keys move between points and show the tooltip. Its text and shapes are not read out separately, so the data is announced once, from the table. The legend is `aria-hidden` for the same reason; series names are table headers.
- Colour is not the only channel: series are named in the legend, tooltip and table, and Scatter series also differ in marker shape.
- There is no chart animation, so nothing needs a reduced-motion variant.

## Formatting

`valueFormat` uses `Intl.NumberFormat` (`en-US`) for axis ticks, tooltips and the data table. It changes display text only. `percent` follows the standard convention: `0.25` shows as `25%`. An invalid format (unknown currency, impossible digit count) falls back to plain numbers instead of throwing. X values are shown as given, with no grouping separators, so `2024` stays `2024`.

## Styling

Series colours are `--ui-chart-1` … `--ui-chart-6` (repeating after six), defined for light and dark. Everything else uses the existing `--ui-*` tokens, so both themes need no extra rules. Long category labels are shortened on the axis and complete in the tooltip and table. The legend wraps, and the plot shrinks with its container.

## OpenUI API

```text
Chart(type, data, xKey, series, title?, description?, xAxisLabel?, yAxisLabel?, valueFormat?, showLegend?, showPoints?, horizontal?, height?)
```

| Argument | Notes |
| --- | --- |
| `type` | `bar`, `line`, `area` or `scatter` |
| `data` | Array of row objects; values are text, numbers or `null` |
| `xKey` | Field holding the X values |
| `series` | Array of `{dataKey, label}` objects |
| `valueFormat` | Object `{style, currency, maximumFractionDigits}` |

```text
root = Chart("line", data, "month", [{dataKey: "sales", label: "Sales"}], "Monthly sales")
data = [{month: "Jan", sales: 120}, {month: "Feb", sales: 160}]
```

`showTooltip` and `showGrid` are React-only. Chart is accepted as a child of `Stack`, `Card` and `Grid`. It has no writable state or bindings.

## Limitations

No stacking, dual axes, zoom, pan, brush, click-to-filter, annotations or chart animation. Large datasets are not sampled. Chart is not a replacement for Table when exact values matter.
