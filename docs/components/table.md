# Table

Classification: `level: "composite"`, `family: "data-display"`.

```text
visual/components/Table/
  Table.tsx          React component and public props
  Table.css          Scroll region, density, striping and alignment (imported through styles/components.css)
  Table.openui.tsx   OpenUI schema: Table(columns, rows, caption?, density?, striped?, emptyMessage?)
  Table.examples.ts  OpenUI examples, spread into `examples` in registry.ts
  Table.stories.tsx  Storybook stories
```

`Table.tsx` renders native `table`, `caption`, `thead`, `tbody`, `th` and `td` elements and imports nothing from OpenUI, the board or MCP. It is a read-only display of structured data. There is no sorting, filtering, pagination, selection, editing, virtualization or custom cell rendering, and none is planned: it is not a DataTable.

## React API

| Prop | Type | Default |
| --- | --- | --- |
| `columns` | `{key: string; header: string; align?: "start" \| "center" \| "end"}[]` | required |
| `rows` | `Record<string, string \| number \| null>[]` | required |
| `caption` | `string` | none |
| `density` | `"default" \| "compact"` | `"default"` |
| `striped` | `boolean` | `false` |
| `emptyMessage` | `string` | `"No data"` |

```tsx
<Table
  columns={[{key: "name", header: "Name"}, {key: "score", header: "Score", align: "end"}]}
  rows={[{name: "Alpha", score: 82}, {name: "Beta", score: 94}]}
  caption="Assessment results"
/>
```

`className`, `style` and other `div` attributes go to the outer scroll region, and `ref` (React 19 ref-as-prop) points at it.

## Behavior

- **Semantics.** Every header is `<th scope="col">`, so each body cell is associated with its column. The caption is a visible `<caption>` that is also the accessible name of the table and of its scroll region. Without a caption the region is named "Table".
- **Empty values.** A `null`, missing or empty value renders a dash for sighted users and "No value" for screen readers.
- **Empty data.** With no rows the headers stay and one full-width cell shows `emptyMessage`.
- **Overflow.** The table sits in a focusable `role="region"` that scrolls sideways, so a wide table never widens its parent and can be scrolled with the keyboard. Header text does not wrap; long cell text wraps, even inside an unbroken string.
- **Numbers.** Cells use tabular figures; set `align: "end"` on numeric columns.
- **Styling.** Only `--ui-*` tokens, so light and dark themes need no extra rules.

## OpenUI API

```text
Table(columns, rows, caption?, density?, striped?, emptyMessage?)
```

| Argument | Notes |
| --- | --- |
| `columns` | Array of `{key, header, align?}` objects |
| `rows` | Array of objects keyed by column `key`; values are text, numbers or `null` |
| `caption` | Visible title; always set it |
| `density` | `default` or `compact` |
| `striped` | `true` shades every second row |
| `emptyMessage` | Text for an empty `rows` array |

```text
root = Table(cols, data, "Assessment results", "compact", true)
cols = [{key: "name", header: "Name"}, {key: "score", header: "Score", align: "end"}]
data = [{name: "Alpha", score: 82}, {name: "Beta", score: 94}]
```

Skip an optional argument with `null`. The model writes data, not a tree of row and cell components; cells cannot contain components (use [Markdown](markdown.md) for rich table content). Table is accepted as a child of `Stack`, `Card` and `Grid`.

## Limitations

No sorting, filtering, pagination, row selection, editing, row headers, column widths, merged cells or component cells.
