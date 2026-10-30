// Positional args: Spacer(size)
// size is optional (default md): xs, sm, md, lg, xl for fixed space, or grow to fill the remaining room.
// Spacer adds to the parent's gap, so pair it with a small or "none" gap. For ordinary spacing use Stack gap instead.
export const spacerExamples = [
  {
    title: "Header with actions pushed to the right",
    code: `root = Stack([title, Spacer("grow"), Icon("bell", "md", "muted"), Button("New")], "sm", "horizontal", "center", "start", false, "none", "full")\ntitle = Text("Project", "default", "heading", "h2")`,
  },
  {
    title: "Uneven spacing between sections",
    code: `root = Stack([Text("Summary", "default", "heading", "h2"), Text("A short introduction.", "muted"), Spacer("xl"), Text("Details", "default", "heading", "h2"), Text("The rest of the content.", "muted")], "xs")`,
  },
  {
    title: "Fixed Spacer in a row and in a Card",
    code: `root = Stack([row, card], "lg")\nrow = Stack([Text("Left", "default", "label"), Spacer("lg"), Text("Right", "default", "label")], "none", "horizontal", "center")\ncard = Card(null, null, [Text("Body copy"), Spacer("lg"), Divider(), Text("Footer note", "muted", "caption")], "default", "md", "none")`,
  },
];
