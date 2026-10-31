import {defineComponent} from "@openuidev/react-lang";
import {z} from "zod/v4";
import {Table, tableAligns, tableDensities, type TableColumn, type TableRow} from "./Table";

// Positional order matters in OpenUI Lang: columns, rows, then caption and the display options.
// Rows are plain objects keyed by column key, so the model writes data, not a tree of row and cell components.
const columnSchema = z.object({
  key: z.string().describe("Row field shown in this column, e.g. \"name\""),
  header: z.string().describe("Column heading text"),
  align: z.enum(tableAligns).optional().describe("start (default), center or end. Use end for numbers"),
});

const tableProps = z.object({
  columns: z.array(columnSchema).describe("Column definitions in display order: {key: \"score\", header: \"Score\", align: \"end\"}"),
  rows: z.array(z.record(z.string(), z.union([z.string(), z.number(), z.null()]))).describe("One object per row, keyed by column key: {name: \"Alpha\", score: 82}. Values are text, numbers or null for an empty cell"),
  caption: z.string().optional().describe("Visible title that also names the table for assistive technology"),
  density: z.enum(tableDensities).optional().describe("default or compact (tighter rows). Default default"),
  striped: z.boolean().optional().describe("Shade every second row. Default false"),
  emptyMessage: z.string().optional().describe("Text shown when rows is empty. Default \"No data\""),
});

export const tableDefinition = defineComponent({
  name: "Table",
  description: "A read-only table of structured data: Table(columns, rows, caption, density, striped, emptyMessage). Columns are objects {key, header, align} and rows are objects keyed by column key, e.g. Table([{key: \"name\", header: \"Name\"}, {key: \"score\", header: \"Score\", align: \"end\"}], [{name: \"Alpha\", score: 82}]). It does not sort, filter, page or select, and cells hold only text, numbers or null: use Markdown for rich cell content and Text for a single value. Wide tables scroll sideways.",
  props: tableProps,
  component: ({props}) => {
    const columns: TableColumn[] = (props.columns ?? []).map(c => ({key: c.key, header: c.header, ...(c.align != null ? {align: c.align} : {})}));
    const rows: TableRow[] = props.rows ?? [];
    // Skipped optional arguments (null, or an unresolved expression) must not reach the component, where defaults only apply to undefined.
    const {caption, density, striped, emptyMessage} = Object.fromEntries(Object.entries(props).filter(([, v]) => v != null)) as Partial<typeof props>;
    return <Table columns={columns} rows={rows} caption={caption} density={density} striped={striped} emptyMessage={emptyMessage} />;
  },
});
