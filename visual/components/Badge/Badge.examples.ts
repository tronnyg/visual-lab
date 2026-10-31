// Positional args: Badge(text, variant)
export const badgeExamples = [
  {
    title: "Badge variants",
    code: 'root = Stack([a, b, c, d, e, f], "sm", "horizontal", "center", null, true)\na = Badge("Default")\nb = Badge("Secondary", "secondary")\nc = Badge("Outline", "outline")\nd = Badge("Active", "success")\ne = Badge("Pending", "warning")\nf = Badge("Overdue", "danger")',
  },
  {
    title: "Badges in a card",
    code: 'root = Card(null, null, [title, tags])\ntitle = Text("Release 2.4", "default", "subheading")\ntags = Stack([a, b], "xs", "horizontal")\na = Badge("New", "success")\nb = Badge("Beta", "secondary")',
  },
  {
    title: "Badge from a variable",
    code: 'root = Stack([status, pick, note], "sm")\n$count = 3\nstatus = Badge($count + " open", $count > 0 ? "warning" : "success")\npick = Slider($count, "Open items", 0, 10)\nnote = Text("The badge text and variant follow the slider.", "muted", "caption")',
  },
] as const;
