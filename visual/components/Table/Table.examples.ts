// Positional args: Table(columns, rows, caption, density, striped, emptyMessage)
export const tableExamples = [
  {
    title: "Table of results",
    code: 'root = Table(cols, data, "Assessment results")\ncols = [{key: "name", header: "Name"}, {key: "status", header: "Status"}, {key: "score", header: "Score", align: "end"}]\ndata = [{name: "Alpha", status: "Passed", score: 82}, {name: "Beta", status: "Passed", score: 94}, {name: "Gamma", status: "Needs review", score: 61}]',
  },
  {
    title: "Compact striped table with empty cells",
    code: 'root = Table(cols, data, "Illustrative sample data", "compact", true)\ncols = [{key: "item", header: "Item"}, {key: "qty", header: "Qty", align: "end"}, {key: "note", header: "Note"}]\ndata = [{item: "Widget", qty: 12, note: "In stock"}, {item: "Gadget", qty: 0, note: null}, {item: "Gizmo", qty: 7, note: "Backordered"}]',
  },
  {
    title: "Empty table",
    code: 'root = Table(cols, [], "Open tasks", null, null, "No open tasks")\ncols = [{key: "task", header: "Task"}, {key: "owner", header: "Owner"}]',
  },
  {
    title: "Table in a card",
    code: 'root = Card(null, null, [title, table])\ntitle = Text("Quarterly summary", "default", "subheading")\ntable = Table([{key: "quarter", header: "Quarter"}, {key: "revenue", header: "Revenue", align: "end"}], [{quarter: "Q1", revenue: "$120k"}, {quarter: "Q2", revenue: "$150k"}], "Illustrative figures")',
  },
] as const;
