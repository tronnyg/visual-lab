// Positional args: Card(title, body, children, variant, padding, gap, radius, shadow, background, border, width)
// title and body are legacy; new documents put Text children in the third position and skip the first two with null.
export const cardExamples = [
  {
    title: "Card variants and nesting",
    code: 'root = Stack([intro, plain, row, outer], "lg")\nintro = Text("Cards group content", "default", "heading", "h2")\nplain = Card(null, null, [name, note])\nname = Text("Default card", "default", "subheading", "h3")\nnote = Text("Children stack vertically with no inner Stack.", "muted")\nrow = Stack([a, b, c], "md", "horizontal", "stretch", "start", true)\na = Card(null, null, [Text("Outline")], "outline")\nb = Card(null, null, [Text("Filled")], "filled")\nc = Card(null, null, [Text("Subtle, raised")], "subtle", "md", "md", "lg", "sm")\nouter = Card(null, null, [label, inner, save], "default", "lg", "md", "lg", "md", "muted", null, "md")\nlabel = Text("Outer card", "default", "label")\ninner = Card(null, null, [Text("Nested card")], "outline", "sm")\nsave = Button("Save")',
  },
];
