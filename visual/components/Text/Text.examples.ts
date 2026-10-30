// Positional args: Text(value, tone, preset, as, size, weight, align, italic, underline, strikethrough, highlight, lineHeight, wrap, preserveWhitespace, truncate, lineClamp)
export const textExamples = [
  {
    title: "Text hierarchy and semantic elements",
    code: 'root = Stack([eyebrow, title, intro, section, body, note], "sm")\neyebrow = Text("Quarterly review", "accent", "overline", "span")\ntitle = Text("Results at a glance", "default", "title", "h1")\nintro = Text("The element sets the document outline; the preset sets how it looks.", "muted", "subheading", "p")\nsection = Text("What changed", "default", "heading", "h2")\nbody = Text("Revenue grew while support volume fell, so the team reinvested the time in onboarding.")\nnote = Text("Illustrative figures only.", "muted", "caption")',
  },
  {
    title: "Text styling and truncation",
    code: 'root = Stack([a, b, c, d, e], "sm")\na = Text("Important:", "danger", "label", "strong", null, "bold")\nb = Text("Centered, balanced headline that wraps evenly across lines", "default", "heading", "h3", null, null, "center", false, false, false, false, null, "balance")\nc = Text("Marked, underlined and struck-through", "default", "body", "span", null, null, null, true, true, true, true)\nd = Text("A long line that is cut off with an ellipsis once it no longer fits in the available width of its container.", "muted", "body", "p", null, null, null, false, false, false, false, null, null, false, true)\ne = Text("A longer paragraph limited to two lines. It keeps going so the clamp has something to cut: the quick brown fox jumps over the lazy dog, again and again, until there is no more room left to show.", "muted", "body", "p", null, null, null, false, false, false, false, null, null, false, false, 2)',
  },
  {
    title: "Reactive text",
    code: 'root = Stack([status, detail, add], "sm")\n$count = 0\nstatus = Text("Clicked " + $count + " times", "default", "heading", "h2")\ndetail = Text($count, "muted", "code")\nadd = Button("Add one", false, "primary", "default", false, false, "plus", null, @Set($count, $count + 1))',
  },
] as const;
