// Positional args: Progress(value, max, label)
export const progressExamples = [
  {
    title: "Progress values",
    code: 'root = Stack([a, b, c, d], "md")\na = Progress(0, 100, "Not started")\nb = Progress(35, 100, "Partly done")\nc = Progress(80, 100, "Almost done")\nd = Progress(100, 100, "Complete")',
  },
  {
    title: "Progress with a maximum",
    code: 'root = Stack([caption, bar], "sm")\ncaption = Text("3 of 5 steps complete", "muted", "caption")\nbar = Progress(3, 5, "Setup steps")',
  },
  {
    title: "Progress following a slider",
    code: 'root = Stack([label, bar, pick], "sm")\n$done = 40\nlabel = Text("Upload: " + $done + "%", "default", "label")\nbar = Progress($done, 100, "Upload progress")\npick = Slider($done, "Set progress", 0, 100)',
  },
  {
    title: "Progress in a card",
    code: 'root = Card(null, null, [title, note, bar])\ntitle = Text("Storage", "default", "subheading")\nnote = Text("6.2 GB of 10 GB used", "muted", "caption")\nbar = Progress(6.2, 10, "Storage used")',
  },
] as const;
