// Positional args: List(items, variant, start, density)
export const listExamples = [
  {
    title: "Bulleted list",
    code: 'root = List(["Fast to render", "Works in light and dark themes", "Keyboard and screen reader friendly"])',
  },
  {
    title: "Numbered steps",
    code: 'root = Stack([heading, steps], "sm")\nheading = Text("Getting started", "default", "subheading")\nsteps = List(["Prepare materials", "Review results", "Summarize findings"], "ordered")',
  },
  {
    title: "Numbered list from a custom start",
    code: 'root = List(["Fourth step", "Fifth step", "Sixth step"], "ordered", 4, "compact")',
  },
  {
    title: "Nested list",
    code: 'root = List(items, "unordered")\nitems = [{content: "Frontend", items: ["Components", "Styles"]}, {content: "Backend", items: ["API", "Database"]}, "Documentation"]',
  },
  {
    title: "List in a card",
    code: 'root = Card(null, null, [title, list])\ntitle = Text("Release checklist", "default", "subheading")\nlist = List(["Update the changelog", "Tag the release", "Announce it"], "ordered", null, "compact")',
  },
] as const;
