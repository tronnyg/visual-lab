// Positional args: Spinner(size, label)
export const spinnerExamples = [
  {
    title: "Spinner sizes",
    code: 'root = Stack([a, b, c], "md", "horizontal", "center")\na = Spinner("sm")\nb = Spinner("md")\nc = Spinner("lg")',
  },
  {
    title: "Spinner with a loading label",
    code: 'root = Stack([spin, caption], "sm")\nspin = Spinner("lg", "Loading results")\ncaption = Text("The label is read by screen readers and not drawn.", "muted", "caption")',
  },
  {
    title: "Spinner beside visible text",
    code: 'root = Stack([spin, text], "sm", "horizontal", "center")\nspin = Spinner("sm")\ntext = Text("Saving your changes…", "muted")',
  },
  {
    title: "Spinner in a card",
    code: 'root = Card(null, null, [title, row])\ntitle = Text("Generating report", "default", "subheading")\nrow = Stack([spin, note], "sm", "horizontal", "center")\nspin = Spinner("md")\nnote = Text("This can take a minute.", "muted", "caption")',
  },
] as const;
