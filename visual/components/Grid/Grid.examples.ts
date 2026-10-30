// Positional args: Grid(children, columns, gap, rowGap, columnGap, align, justify, minColumnWidth, width)
// Only children is required; skip optional arguments you do not need with null. Defaults: 2 columns, md gap, stretch, stretch, sm, auto.
// minColumnWidth lets the grid drop to fewer columns in a narrow container; "none" always keeps the requested columns.
export const gridExamples = [
  {
    title: "Grid with two and three columns of Cards",
    code: `root = Stack([intro, two, three], "lg")\nintro = Text("Grid layouts", "default", "heading", "h2")\ntwo = Grid([Card("First", "Cards fill each column."), Card("Second", "Rows wrap automatically."), Card("Third", "Items keep their order."), Card("Fourth", "Two columns by default.")])\nthree = Grid([Card("One", "Three columns."), Card("Two", "Equal widths."), Card("Three", "Shared gap.")], 3, "sm")`,
  },
  {
    title: "Grid with four columns and different gaps",
    code: `root = Stack([Text("Gaps", "default", "heading", "h2"), tight, spacious, mixed], "lg")\ntight = Grid([Card("A"), Card("B"), Card("C"), Card("D")], 4, "xs")\nspacious = Grid([Card("A"), Card("B"), Card("C"), Card("D")], 4, "lg")\nmixed = Grid([Card("A"), Card("B"), Card("C"), Card("D")], 2, "md", "lg", "xs")`,
  },
  {
    title: "Grid with mixed components, nested Grid and Stack",
    code: `root = Stack([Text("Dashboard", "default", "heading", "h2"), grid], "lg")\ngrid = Grid([summary, Image("/assets/sample-landscape.svg", "Stylised hills", "4:3", "cover"), details], 3, "md", null, null, "start")\nsummary = Card(null, null, [Text("Summary", "default", "subheading", "h3"), Text("Mixed components share one grid.", "muted"), Button("Open")], "default", "md", "sm")\ndetails = Stack([Text("Details", "default", "subheading", "h3"), Grid([Text("Status", "muted", "caption"), Text("Active", "default", "label"), Text("Owner", "muted", "caption"), Text("Visual Lab", "default", "label")], 2, "xs")], "sm")`,
  },
  {
    title: "Grid in a narrow container",
    code: `root = Stack([Text("Responsive grid", "default", "heading", "h2"), Text("Four columns in a narrow Stack drop to fewer columns, and minColumnWidth none keeps all four.", "muted"), narrow, fixed], "lg")\nnarrow = Stack([Grid([Card("1"), Card("2"), Card("3"), Card("4")], 4)], "md", "vertical", "stretch", "start", false, "none", "sm")\nfixed = Stack([Grid([Card("1"), Card("2"), Card("3"), Card("4")], 4, "xs", null, null, null, null, "none")], "md", "vertical", "stretch", "start", false, "none", "sm")`,
  },
];
