// Positional args: Stack(children, gap, direction, align, justify, wrap, padding, width, flex)
export const stackExamples = [
  {
    title: "Stack rows and nested layout",
    code: 'root = Stack([title, actions, cards], "lg")\ntitle = Text("Dashboard", "default", "title", "h1")\nactions = Stack([save, cancel], "sm", "horizontal", "center", "end")\nsave = Button("Save")\ncancel = Button("Cancel", false, "secondary")\ncards = Stack([a, b], "md", "horizontal", "stretch", "start", true)\na = Card("Revenue", "Illustrative figures only.")\nb = Card("Support", "Illustrative figures only.")',
  },
];
