// Positional args: Button(label, disabled, variant, size, loading, fullWidth, leadingIcon, trailingIcon, actionId)
export const buttonExamples = [
  {
    title: "Button variants and sizes",
    code: 'root = Stack([variants, sizes])\nvariants = Stack([b1, b2, b3, b4, b5, b6], "sm")\nb1 = Button("Primary", false, "primary")\nb2 = Button("Secondary", false, "secondary")\nb3 = Button("Outline", false, "outline")\nb4 = Button("Ghost", false, "ghost")\nb5 = Button("Delete", false, "destructive", "default", false, false, "trash")\nb6 = Button("Link", false, "link")\nsizes = Stack([s1, s2, s3, s4], "sm")\ns1 = Button("Extra small", false, "outline", "xs")\ns2 = Button("Small", false, "outline", "sm")\ns3 = Button("Default", false, "outline", "default")\ns4 = Button("Large", false, "outline", "lg")',
  },
  {
    title: "Button states, icons and width",
    code: 'root = Stack([a, b, c, d, e], "sm")\na = Button("Disabled", true, "secondary")\nb = Button("Saving", false, "primary", "default", true)\nc = Button("Download", false, "outline", "default", false, false, "download")\nd = Button("Continue", false, "primary", "default", false, false, null, "arrow-right")\ne = Button("Full width", false, "primary", "lg", false, true)',
  },
  {
    title: "Button action",
    code: 'root = Stack([intro, action], "sm")\nintro = Text("Click the button to notify the agent.", "muted")\naction = Button("Show explanation", false, "primary", "default", false, false, null, "arrow-right", "show-explanation")',
  },
] as const;
